FROM node:21

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci
COPY ./server.js ./
COPY ./db.js ./
COPY ./crawl.js ./
COPY ./suggestionGeneration.js ./

CMD ["npm","start"]
