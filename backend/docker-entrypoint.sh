#!/bin/sh
set -e

echo "▶ Rodando migrations do banco..."
npx prisma migrate deploy

echo "▶ Rodando seed (cria admin e dados iniciais)..."
node prisma/seed.js

echo "▶ Iniciando servidor..."
exec node src/server.js
