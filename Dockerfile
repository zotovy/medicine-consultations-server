FROM node:12

# instalation
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 443

# Build
RUN npm run build

# start
CMD [ "npm", "run", "start" ]
