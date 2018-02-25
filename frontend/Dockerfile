FROM node:carbon
WORKDIR /dreambox/frontend
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
