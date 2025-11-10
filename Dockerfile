# Etapa 1: Compilación
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Instalar dependencias necesarias para build
RUN npm install && npm install typescript

COPY . .

# Compilar TypeScript
RUN npm run build

# Etapa 2: Producción
FROM node:22-alpine

WORKDIR /app

# Copiar archivos necesarios desde builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Instalar solo dependencias de producción
RUN npm install --only=production

# Exponer puerto
EXPOSE 8080

# Iniciar aplicación
CMD ["node", "dist/index.js"]
