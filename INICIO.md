# Inicio del proyecto

## Comando unico (frontend + backend)

Primero instala dependencias (si no lo hiciste):

npm install

Luego, en la raiz del proyecto ejecuta:

npm run dev:full

Si aun asi falla porque no encuentra `concurrently`, puedes usar este comando alternativo:

npx concurrently "npm run server" "npm run dev"

Esto levanta:
- Frontend (Vite) en http://localhost:5173
- Backend (Express + SQLite) en http://localhost:3002

## Base de datos

La base de datos es SQLite y se crea/usa en:
server\database.sqlite
