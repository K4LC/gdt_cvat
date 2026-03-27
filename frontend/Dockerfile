FROM node:22-slim

WORKDIR /frontend

COPY package.json package-lock.json ./

RUN npm install

CMD ["npm", "run", "dev"]