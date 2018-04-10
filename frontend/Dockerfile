FROM node:8-slim

WORKDIR /dreambox/frontend

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

CMD yarn start
