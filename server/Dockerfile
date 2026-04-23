FROM node:20-alpine

ENV PORT 8080
WORKDIR /app
COPY package*.json ./
RUN npm i
CMD ["npm", "run", "start:dev"]