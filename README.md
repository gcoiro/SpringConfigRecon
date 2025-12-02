# SpringConfigRecon

Herramienta para recolectar la configuracion de microservicios Spring Boot desplegados en Kubernetes/Openshift, separarla en
configuracion compartida (`application.yml`) y configuracion especifica de cada microservicio (`<servicio>.yml`).

## Backend (Python/FastAPI)

- Ubicacion: `backend/`
- Endpoint `/analyze` recibe la URL de `actuator/env` (ej: `http://orders.svc.cluster.local/actuator/env`), descarga propiedades y devuelve dos YAML: el recomendado para `application.yml` y el archivo propio del microservicio.
- Requiere Python 3.11+. Instalacion rapida:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Frontend (nginx estatico)

- Ubicacion: `frontend/` (HTML/CSS/JS en `frontend/static/`).
- Servido directamente por nginx, sin dependencias de Node ni Angular.
- Ejecutar con Docker:

```bash
docker build -f frontend/Dockerfile -t spring-config-recon-frontend .
docker run --rm -p 8080:8080 spring-config-recon-frontend
```

- Para una prueba rapida sin contenedor puedes usar `python -m http.server 8080 --directory frontend/static`, asegurando que
  `/api` resuelva al backend.

> La UI asume que el backend se expone en `/api`. En Kubernetes puedes montar un Ingress/Route que enrute `/api` al servicio del backend y el resto al frontend.

## Flujo esperado

1. Despliegas el backend en el cluster (ej. como Deployment/Service) y lo expones internamente.
2. El frontend se comunica con `/api/analyze` enviando `service_name` y `env_url` (ej: `http://orders.svc.cluster.local/actuator/env`).
3. El backend clasifica propiedades comunes (Spring, management, logging, etc.) y especificas del microservicio. El resultado incluye dos cadenas YAML listas para copiar en `application.yml` y `orders.yml` dentro del repositorio de configuracion.

## Habilitar /actuator/env en tu microservicio Spring Boot

El backend necesita que cada microservicio exponga el endpoint `/actuator/env` para leer las propiedades efectivas (usa solo en entornos de desarrollo/test). Ejemplo en `application.yml`:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: "env,health,info"
  endpoint:
    env:
      enabled: true
```

Si cambiaste el `base-path`, ajusta la URL que envias a `/api/analyze`. Protege el actuator con red interna o autenticacion.
