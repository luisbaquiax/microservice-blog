# Etapa 1: Compilación
FROM node:22-alpine AS builder

# Crear directorio de la app
WORKDIR /app

# Copiar package.json y package-lock.json o npm-shrinkwrap.json si existiera
COPY package*.json ./

# Instalar dependencias (solo las necesarias para build)
RUN npm install --only=production && npm install typescript

# Copiar el código fuente
COPY . .

# Compilar TypeScript
RUN npm run build


# Etapa 2: Imagen final (producción)
FROM node:22-alpine

WORKDIR /app

# Copiar solo archivos necesarios desde la imagen builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env .env

# Instalar solo dependencias de producción
RUN npm install --only=production

# Exponer el puerto del backend
EXPOSE 8080

# Comando de inicio
CMD ["npm", "run", "start"]
