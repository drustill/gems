FROM node:21

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci
COPY ./distribution/ ./distribution
COPY ./distribution.js ./
COPY ./config.js ./

CMD ["npm","start"]
