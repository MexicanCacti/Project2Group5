FROM node:20-alpine

ENV PORT 3000
WORKDIR /app
COPY package*.json ./
RUN npm i
CMD ["npm", "run", "start:dev"]