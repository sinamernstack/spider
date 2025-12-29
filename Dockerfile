FROM node:18-alpine
WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node","dist/index.js"]
