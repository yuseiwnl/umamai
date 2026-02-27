# Frontend Dockerfile (Next.js)
FROM node:20-alpine

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install

# Copy app code
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
