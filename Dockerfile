FROM node:12

# instalation
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
ADD . /usr/src/app
RUN npm run build
RUN ls /usr/src/app/build

# start
CMD [ "npm", "run", "start" ]
EXPOSE 5000
