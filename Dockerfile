# ====== Etapa 1: Build ======
FROM node:20-alpine AS build

# Instalar dependencias necesarias
WORKDIR /app
COPY package*.json ./
RUN npm install -g expo-cli
RUN npm install

# Copiar el resto del código
COPY . .

# Construir la versión web estática
RUN npx expo export --platform web

# ====== Etapa 2: Servidor web (Nginx) ======
FROM nginx:alpine

# Copiar archivos generados al directorio web de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
