#!/bin/bash

# ============================================================
# SeminarSidang Server Management Script
# Domain  : jadwal.otomasi.app
# Frontend: port 3000
# Backend : port 3001
# ============================================================

APP_DIR="/root/SeminarSidang"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
DOMAIN="jadwal.otomasi.app"
BACKEND_PORT=3001
FRONTEND_PORT=3000
APP_BACKEND="seminar-backend"
APP_FRONTEND="seminar-frontend"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════╗"
    echo "║        SeminarSidang Server Management           ║"
    echo "║        Domain: jadwal.otomasi.app                ║"
    echo "╚══════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_menu() {
    echo -e "${BLUE}┌─────────────────────────────────┐${NC}"
    echo -e "${BLUE}│           MENU                  │${NC}"
    echo -e "${BLUE}├─────────────────────────────────┤${NC}"
    echo -e "${BLUE}│  1. Start All                   │${NC}"
    echo -e "${BLUE}│  2. Stop All                    │${NC}"
    echo -e "${BLUE}│  3. Restart All                 │${NC}"
    echo -e "${BLUE}│  4. Status                      │${NC}"
    echo -e "${BLUE}│  5. Build & Install Dependencies│${NC}"
    echo -e "${BLUE}│  0. Exit                        │${NC}"
    echo -e "${BLUE}└─────────────────────────────────┘${NC}"
    echo -ne "${YELLOW}Pilih menu [0-5]: ${NC}"
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo -e "${RED}[ERROR] Script ini harus dijalankan sebagai root!${NC}"
        exit 1
    fi
}

start_all() {
    echo -e "${GREEN}[START] Memulai semua service...${NC}"

    # Start Backend
    echo -e "${CYAN}» Starting Backend (port $BACKEND_PORT)...${NC}"
    cd "$BACKEND_DIR" || exit 1
    if [ ! -f ".env" ]; then
        cp .env.example .env
        sed -i "s/PORT=3000/PORT=$BACKEND_PORT/" .env
        sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=https://$DOMAIN|" .env
        echo -e "${YELLOW}  [INFO] .env dibuat dari .env.example${NC}"
    fi
    PORT=$BACKEND_PORT pm2 start server.js --name "$APP_BACKEND" -- --prod 2>/dev/null || \
    pm2 restart "$APP_BACKEND" 2>/dev/null
    echo -e "${GREEN}  [OK] Backend started${NC}"

    # Start Frontend (serve static build)
    echo -e "${CYAN}» Starting Frontend (port $FRONTEND_PORT)...${NC}"
    if [ -d "$FRONTEND_DIR/dist" ]; then
        pm2 start --name "$APP_FRONTEND" npx -- serve "$FRONTEND_DIR/dist" -l $FRONTEND_PORT -s 2>/dev/null || \
        pm2 restart "$APP_FRONTEND" 2>/dev/null
        echo -e "${GREEN}  [OK] Frontend started${NC}"
    else
        echo -e "${RED}  [ERROR] Frontend belum di-build! Jalankan menu 5 dahulu.${NC}"
    fi

    pm2 save
    echo -e "${GREEN}[START] Semua service berhasil dijalankan!${NC}"
}

stop_all() {
    echo -e "${YELLOW}[STOP] Menghentikan semua service...${NC}"
    pm2 stop "$APP_BACKEND" 2>/dev/null && echo -e "${GREEN}  [OK] Backend stopped${NC}" || echo -e "${YELLOW}  [SKIP] Backend tidak berjalan${NC}"
    pm2 stop "$APP_FRONTEND" 2>/dev/null && echo -e "${GREEN}  [OK] Frontend stopped${NC}" || echo -e "${YELLOW}  [SKIP] Frontend tidak berjalan${NC}"
    echo -e "${GREEN}[STOP] Semua service dihentikan.${NC}"
}

restart_all() {
    echo -e "${YELLOW}[RESTART] Merestart semua service...${NC}"
    pm2 restart "$APP_BACKEND" 2>/dev/null && echo -e "${GREEN}  [OK] Backend restarted${NC}" || \
        (echo -e "${YELLOW}  Backend belum ada, starting...${NC}" && start_all)
    pm2 restart "$APP_FRONTEND" 2>/dev/null && echo -e "${GREEN}  [OK] Frontend restarted${NC}"
    pm2 save
    echo -e "${GREEN}[RESTART] Selesai.${NC}"
}

show_status() {
    echo -e "${CYAN}[STATUS] Menampilkan status service...${NC}"
    echo ""
    pm2 list
    echo ""
    echo -e "${CYAN}──────────────────────────────────────${NC}"
    echo -e "${CYAN}Nginx Status:${NC}"
    systemctl is-active --quiet nginx && echo -e "${GREEN}  ✓ Nginx: RUNNING${NC}" || echo -e "${RED}  ✗ Nginx: STOPPED${NC}"
    echo -e "${CYAN}PM2 Status:${NC}"
    pm2 info "$APP_BACKEND" 2>/dev/null | grep -E "status|uptime" | head -3
    echo ""
    echo -e "${CYAN}Port Check:${NC}"
    ss -tlnp 2>/dev/null | grep -E ":$FRONTEND_PORT|:$BACKEND_PORT|:80|:443" | awk '{print "  "$0}'
    echo ""
    echo -e "${CYAN}SSL Certificate:${NC}"
    certbot certificates 2>/dev/null | grep -A 3 "$DOMAIN" || echo -e "  ${YELLOW}Belum ada sertifikat SSL${NC}"
}

install_all() {
    echo -e "${GREEN}[INSTALL] Menginstall semua dependensi...${NC}"
    echo ""

    # Update system
    echo -e "${CYAN}» Update package list...${NC}"
    apt-get update -qq

    # Install Node.js
    if ! command -v node &>/dev/null; then
        echo -e "${CYAN}» Install Node.js 20...${NC}"
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
        echo -e "${GREEN}  [OK] Node.js $(node -v) installed${NC}"
    else
        echo -e "${GREEN}  [OK] Node.js $(node -v) sudah ada${NC}"
    fi

    # Install PM2
    if ! command -v pm2 &>/dev/null; then
        echo -e "${CYAN}» Install PM2...${NC}"
        npm install -g pm2
        pm2 startup systemd -u root --hp /root
        echo -e "${GREEN}  [OK] PM2 installed${NC}"
    else
        echo -e "${GREEN}  [OK] PM2 $(pm2 -v) sudah ada${NC}"
    fi

    # Install serve (untuk frontend)
    if ! command -v serve &>/dev/null; then
        echo -e "${CYAN}» Install serve...${NC}"
        npm install -g serve
        echo -e "${GREEN}  [OK] serve installed${NC}"
    else
        echo -e "${GREEN}  [OK] serve sudah ada${NC}"
    fi

    # Install Nginx
    if ! command -v nginx &>/dev/null; then
        echo -e "${CYAN}» Install Nginx...${NC}"
        apt-get install -y nginx
        echo -e "${GREEN}  [OK] Nginx installed${NC}"
    else
        echo -e "${GREEN}  [OK] Nginx $(nginx -v 2>&1) sudah ada${NC}"
    fi

    # Install Certbot
    if ! command -v certbot &>/dev/null; then
        echo -e "${CYAN}» Install Certbot...${NC}"
        apt-get install -y snapd
        snap install --classic certbot
        ln -sf /snap/bin/certbot /usr/bin/certbot
        echo -e "${GREEN}  [OK] Certbot installed${NC}"
    else
        echo -e "${GREEN}  [OK] Certbot sudah ada${NC}"
    fi

    # Install Backend dependencies
    echo -e "${CYAN}» Install Backend npm packages...${NC}"
    cd "$BACKEND_DIR" && npm install
    if [ ! -f ".env" ]; then
        cp .env.example .env
        sed -i "s/PORT=3000/PORT=$BACKEND_PORT/" .env
        sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=https://$DOMAIN|" .env
        echo -e "${YELLOW}  [INFO] .env dibuat dari .env.example${NC}"
    fi
    echo -e "${GREEN}  [OK] Backend dependencies installed${NC}"

    # Install Frontend dependencies & build
    echo -e "${CYAN}» Install Frontend npm packages & build...${NC}"
    cd "$FRONTEND_DIR" && npm install

    # Update vite config untuk production API URL
    cat > "$FRONTEND_DIR/vite.config.js" << 'VITEEOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true }
    }
  },
  preview: {
    port: 3000,
    host: '0.0.0.0'
  },
  build: {
    outDir: 'dist'
  }
})
VITEEOF

    npm run build
    echo -e "${GREEN}  [OK] Frontend built ke dist/${NC}"

    # Init database
    echo -e "${CYAN}» Inisialisasi database...${NC}"
    cd "$BACKEND_DIR" && node scripts/init_db.js 2>/dev/null && echo -e "${GREEN}  [OK] Database initialized${NC}" || echo -e "${YELLOW}  [SKIP] Database mungkin sudah ada${NC}"

    # Configure Nginx
    configure_nginx

    # Setup SSL
    setup_ssl

    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  Instalasi selesai!                          ║${NC}"
    echo -e "${GREEN}║  Jalankan menu 1 untuk start semua service   ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
}

configure_nginx() {
    echo -e "${CYAN}» Konfigurasi Nginx untuk $DOMAIN...${NC}"

    cat > /etc/nginx/sites-available/seminar-sidang << NGINXEOF
server {
    listen 80;
    server_name $DOMAIN;

    # Frontend (React SPA)
    location / {
        root $FRONTEND_DIR/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
    }

    access_log /var/log/nginx/seminar-sidang-access.log;
    error_log /var/log/nginx/seminar-sidang-error.log;
}
NGINXEOF

    ln -sf /etc/nginx/sites-available/seminar-sidang /etc/nginx/sites-enabled/seminar-sidang
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null
    nginx -t && systemctl reload nginx && echo -e "${GREEN}  [OK] Nginx dikonfigurasi & direload${NC}" || echo -e "${RED}  [ERROR] Nginx config error, check: nginx -t${NC}"
}

setup_ssl() {
    echo -e "${CYAN}» Setup SSL dengan Certbot untuk $DOMAIN...${NC}"

    # Check if domain resolves to this server
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s api.ipify.org 2>/dev/null)
    DOMAIN_IP=$(dig +short "$DOMAIN" 2>/dev/null | tail -1)

    echo -e "  Server IP : ${CYAN}$SERVER_IP${NC}"
    echo -e "  Domain IP : ${CYAN}$DOMAIN_IP${NC}"

    if [ "$SERVER_IP" = "$DOMAIN_IP" ]; then
        echo -e "${GREEN}  [OK] Domain sudah mengarah ke server ini${NC}"
        echo -e "${CYAN}  Mengambil sertifikat SSL...${NC}"
        certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "admin@otomasi.app" \
            --redirect 2>/dev/null && \
            echo -e "${GREEN}  [OK] SSL berhasil dipasang! https://$DOMAIN${NC}" || \
            echo -e "${YELLOW}  [WARN] SSL gagal, jalankan manual: certbot --nginx -d $DOMAIN${NC}"
    else
        echo -e "${YELLOW}  [SKIP] Domain belum mengarah ke server, pastikan DNS sudah benar${NC}"
        echo -e "  Jalankan manual bila DNS sudah propagasi: ${CYAN}certbot --nginx -d $DOMAIN${NC}"
    fi
}

# ─── Main ───────────────────────────────────────────────────
check_root

print_header

if [ -n "$1" ]; then
    case "$1" in
        1) start_all ;;
        2) stop_all ;;
        3) restart_all ;;
        4) show_status ;;
        5) install_all ;;
    esac
    exit 0
fi

while true; do
    print_menu
    read -r choice
    echo ""
    case "$choice" in
        1) start_all ;;
        2) stop_all ;;
        3) restart_all ;;
        4) show_status ;;
        5) install_all ;;
        0) echo -e "${GREEN}Sampai jumpa!${NC}"; exit 0 ;;
        *) echo -e "${RED}[ERROR] Pilihan tidak valid!${NC}" ;;
    esac
    echo ""
    echo -e "${YELLOW}Tekan Enter untuk kembali ke menu...${NC}"
    read -r
done
