# Frontend Dockerfile

FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./
COPY frontend/vite.config.js ./
COPY frontend/postcss.config.js ./
COPY frontend/tailwind.config.js ./
COPY frontend/ .
RUN npm install
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Serve the app at port 80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
