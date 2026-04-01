#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash deploy/ec2/setup-ec2.sh <domain_or_ip> <deploy_user> <deploy_path>"
  exit 1
fi

DOMAIN_OR_IP="${1:-_}"
DEPLOY_USER="${2:-ubuntu}"
DEPLOY_PATH="${3:-/var/www/html}"
NGINX_SITE_PATH="/etc/nginx/sites-available/mulearn"

echo "Installing nginx and rsync..."
apt-get update -y
apt-get install -y nginx rsync

if ! id "${DEPLOY_USER}" >/dev/null 2>&1; then
  echo "Creating deploy user: ${DEPLOY_USER}"
  adduser --disabled-password --gecos "" "${DEPLOY_USER}"
fi

echo "Preparing deploy directory: ${DEPLOY_PATH}"
mkdir -p "${DEPLOY_PATH}"
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${DEPLOY_PATH}"
find "${DEPLOY_PATH}" -type d -exec chmod 755 {} \;
find "${DEPLOY_PATH}" -type f -exec chmod 644 {} \; || true

echo "Writing nginx site config..."
cat > "${NGINX_SITE_PATH}" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN_OR_IP};

    root ${DEPLOY_PATH};
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }

    location ~* \.(?:css|js|png|jpg|jpeg|gif|webp|svg|ico|woff2?)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800, immutable";
        access_log off;
    }
}
EOF

ln -sf "${NGINX_SITE_PATH}" /etc/nginx/sites-enabled/mulearn
rm -f /etc/nginx/sites-enabled/default

echo "Checking nginx config..."
nginx -t
systemctl enable nginx
systemctl restart nginx

echo "EC2 setup complete."
echo "Site root: ${DEPLOY_PATH}"
echo "Server name: ${DOMAIN_OR_IP}"
