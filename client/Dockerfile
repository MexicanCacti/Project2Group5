FROM node:20-alpine

ENV PORT ${CLIENT_PORT}
WORKDIR /app
COPY package*.json ./
RUN npm i

COPY . .

EXPOSE ${CLIENT_PORT}
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]