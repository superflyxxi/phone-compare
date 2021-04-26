ARG NODE_DOCKER_VERSION=14-alpine3.13
FROM node:${NODE_DOCKER_VERSION}
EXPOSE 3000
MAINTAINER SuperFlyXXI
ENTRYPOINT ["npm"]
CMD ["start"]
ADD . /app
WORKDIR /app
RUN npm --only=production install
