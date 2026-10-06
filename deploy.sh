#!/usr/bin/env bash
# Actualiza producción: bash deploy.sh
#
# El servidor no tiene Node: las pantallas ya vienen compiladas en public/build
# (las compila el pre-commit de quien hizo el cambio). Aquí solo se trae el código,
# se aplican las migraciones y se limpian las cachés.
set -euo pipefail
cd "$(dirname "$0")"

echo "→ Trayendo los cambios"
git pull --ff-only

echo "→ Dependencias de PHP"
composer install --no-dev --optimize-autoloader --no-interaction

echo "→ Base de datos"
php artisan migrate --force

echo "→ Cachés"
# Sin public/hot: si quedara, Laravel buscaría las pantallas en un servidor de desarrollo.
rm -f public/hot
php artisan optimize:clear

if [ ! -f public/build/manifest.json ]; then
    echo "¡Falta public/build/manifest.json! Alguien debe compilar (npm run build) y subirlo." >&2
    exit 1
fi

echo "✓ Listo. Si PHP corre con OPcache (Apache/Nginx con PHP-FPM), reinícialo para que tome el código nuevo."
