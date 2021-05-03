ARG NODE_VERSION=14
FROM node:${NODE_VERSION}-alpine3.13
EXPOSE 3000
MAINTAINER SuperFlyXXI
ENTRYPOINT ["npm"]
CMD ["start"]
ADD . /app
WORKDIR /app
RUN npm --only=production install
