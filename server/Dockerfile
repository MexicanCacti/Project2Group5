FROM node:20-alpine

ENV PORT ${SERVER_PORT}
WORKDIR /app
COPY package*.json ./
RUN npm i
CMD ["npm", "run", "start:dev"]