# Etapa 2: Imagen final (producción)
FROM node:22-alpine

WORKDIR /app

# Copiar solo archivos necesarios desde la imagen builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Instalar solo dependencias de producción
RUN npm install --only=production

# Exponer el puerto del backend
EXPOSE 8080

# Comando de inicio
CMD ["npm", "run", "start"]
