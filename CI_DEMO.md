# Demo de CI/CD

Este archivo se creó para probar el flujo automatizado de QA/Deploy:

1. Push a una rama -> el workflow `.github/workflows/qa-deploy.yml` corre lint, auditoría de seguridad y build.
2. Se genera un comentario automático en el commit con estadísticas del cambio y el estado de seguridad de los endpoints.
3. Al abrir un Pull Request hacia `main`, el mismo workflow corre de nuevo sobre el PR.
