# Chart: springconfigrecon

Chart para desplegar SpringConfigRecon (backend FastAPI + frontend Angular) en clusters OpenShift/Kubernetes.

## Instalacion rapida

```bash
helm upgrade --install springconfigrecon charts/springconfigrecon \
  --set backend.image.repository=<imagen-backend> \
  --set frontend.image.repository=<imagen-frontend>
```

Los valores por defecto crean un unico Deployment con dos contenedores (backend y frontend), dos Services internos y una Route solo para el frontend.

## Valores principales

| Ruta | Descripcion | Valor por defecto |
| --- | --- | --- |
| `imagePullSecrets` | Secrets para pull de imagenes privadas | `[]` |
| `replicaCount` | Replicas del Deployment conjunto | `1` |
| `backend.image.repository` | Imagen del backend | `ghcr.io/your-org/springconfigrecon-backend` |
| `backend.image.tag` | Tag del backend | `latest` |
| `backend.service.port` | Puerto expuesto por el backend | `9150` |
| `frontend.image.repository` | Imagen del frontend | `ghcr.io/your-org/springconfigrecon-frontend` |
| `frontend.image.tag` | Tag del frontend | `1.29.3-trixie-perl` |
| `frontend.service.port` | Puerto expuesto por el frontend | `8080` |
| `frontend.route.enabled` | Crear Route hacia el frontend | `true` |
| `frontend.route.path` | Path de la Route del frontend | `/` |

> Ajusta `host` y `tls` dentro de `frontend.route` para encajar con tu dominio y la politica de encriptacion en OpenShift.
