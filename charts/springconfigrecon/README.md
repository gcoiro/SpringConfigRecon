# Chart: springconfigrecon

Chart para desplegar SpringConfigRecon (backend FastAPI + frontend Angular) en clústeres OpenShift/Kubernetes.

## Instalación rápida

```bash
helm upgrade --install springconfigrecon charts/springconfigrecon \
  --set backend.image.repository=<imagen-backend> \
  --set frontend.image.repository=<imagen-frontend>
```

Los valores por defecto crean **un único Deployment** con dos contenedores (backend y frontend), dos Services internos y una Route solo para el frontend.

## Valores principales

| Ruta | Descripción | Valor por defecto |
| --- | --- | --- |
| `imagePullSecrets` | Secret(s) para pull de imágenes privadas | `[]` |
| `replicaCount` | Réplicas del Deployment conjunto | `1` |
| `backend.image.repository` | Imagen del backend | `ghcr.io/your-org/springconfigrecon-backend` |
| `backend.image.tag` | Tag del backend | `latest` |
| `backend.service.port` | Puerto expuesto por el backend | `8000` |
| `frontend.image.repository` | Imagen del frontend | `ghcr.io/your-org/springconfigrecon-frontend` |
| `frontend.service.port` | Puerto expuesto por el frontend | `80` |
| `frontend.route.enabled` | Crear Route hacia el frontend | `true` |
| `frontend.route.path` | Path de la Route del frontend | `/` |

> Ajusta `host` y `tls` dentro de `frontend.route` para encajar con tu dominio y política de encriptación en OpenShift.
