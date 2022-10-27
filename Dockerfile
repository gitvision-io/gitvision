FROM node:18-alpine

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

RUN ls -a | grep env

RUN npm run build

CMD [ "npm", "run", "prod" ]