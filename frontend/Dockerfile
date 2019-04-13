FROM node:slim

WORKDIR /dreambox/frontend

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

CMD ./run.sh
