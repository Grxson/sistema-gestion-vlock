#!/bin/bash

# Script para ejecutar el servidor con las variables de entorno correctas
export NODE_ENV=development
export DB_HOST=localhost
export DB_USER=root
export DB_PASS=grxson_18
export DB_NAME=sistema_gestion
export DB_PORT=3306
export JWT_SECRET=VlockConsctructora2025Secret
export JWT_EXPIRES=7d

cd /home/grxson/Documentos/Github/sistema-gestion-vlock/backend/api/src
node server.js