# ParseAnything — Production Container
FROM node:20-alpine AS base
WORKDIR /app

# Dependencies layer
COPY package*.json ./
RUN npm ci

# Source files layer
COPY . .

# Build application
RUN npm run build

# Production runtime
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
