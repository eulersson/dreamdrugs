FROM node:alpine

WORKDIR /dreamdrugs/frontend

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

CMD ./run.sh
