# Dockerfile para NestJS Microservicio Cuentas
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar todas las dependencias (necesarias para build)
RUN npm ci

# Copiar código fuente
COPY . .

# Build de la aplicación
RUN npm run build

# Remover devDependencies después del build
RUN npm prune --production

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV DB_HOST=mysql
ENV DB_PORT=3306
ENV DB_USERNAME=cooperativa_user
ENV DB_PASSWORD=cooperativa123
ENV DB_DATABASE=cooperativa_cuentas

# Comando de inicio
CMD ["node", "dist/main"]
