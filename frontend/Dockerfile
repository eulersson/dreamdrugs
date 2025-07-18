FROM node:16-alpine

WORKDIR /dreamdrugs/frontend

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

CMD ./run.sh
