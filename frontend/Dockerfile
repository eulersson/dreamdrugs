FROM node

WORKDIR /dreamdrugs/frontend

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

CMD ./run.sh
