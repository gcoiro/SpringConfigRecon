# SpringConfigRecon

Herramienta para recolectar la configuración de microservicios Spring Boot desplegados en Kubernetes/Openshift, separarla en
configuración compartida (`application.yml`) y configuración específica de cada microservicio (`<servicio>.yml`).

## Backend (Python/FastAPI)

- Ubicación: `backend/`
- Ejecuta un endpoint `/analyze` que recibe la URL de `actuator/env` (p. ej. `http://orders.svc.cluster.local/actuator/env`),
  descarga todas las propiedades y devuelve dos documentos YAML: el recomendado para `application.yml` y el archivo propio del
  microservicio.
- Requiere Python 3.11+. Instalación rápida:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Frontend (Angular)

- Ubicación: `frontend/`
- UI simple para disparar el análisis y visualizar los YAMLs sugeridos.
- Para ejecutar en local necesitas Node 20+ y Angular CLI disponible en el proyecto:

```bash
cd frontend
npm install
npm run start -- --proxy-config proxy.conf.json
```

> El frontend asume que el backend se expone en `/api`. En Kubernetes puedes montar un Ingress/Route que enrute `/api` al
> servicio del backend y el resto al frontend.

## Flujo esperado

1. Despliegas el backend en el clúster (ej. como Deployment/Service) y lo expones internamente.
2. El frontend se comunica con `/api/analyze` enviando `service_name` y `env_url` (p.ej. `http://orders.svc.cluster.local/actuator/env`).
3. El backend clasifica propiedades comunes (Spring, management, logging, etc.) y específicas del microservicio. El resultado
   incluye dos cadenas YAML listas para copiar en `application.yml` y `orders.yml` dentro del repositorio de configuración.

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
