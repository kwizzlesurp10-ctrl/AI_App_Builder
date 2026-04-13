# Build stage
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

# Production stage - serve with lightweight static server
FROM node:22-alpine AS production
WORKDIR /app

RUN npm install -g serve@14.2.6

COPY --from=build /app/dist ./dist

EXPOSE 3000

USER node

CMD ["serve", "-s", "dist", "-l", "3000"]
