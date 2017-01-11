# Preference of specific version over tag like 'latest'
FROM node:6.9.1

# Add our user and group first to make sure their IDs get assigned consistently
RUN groupadd -r app && useradd -r -g app app

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install -g nodemon
RUN npm install -g ts-node
RUN npm install -g typescript
RUN npm install

# Bundle app source
COPY . /usr/src/app
