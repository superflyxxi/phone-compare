ARG NODE_VERSION=14
FROM node:${NODE_VERSION}-alpine3.13
EXPOSE 3000
MAINTAINER SuperFlyXXI
ENV NODE_ENV=production \
	DATA_DIR=/data
ENTRYPOINT ["npm"]
CMD ["start"]
WORKDIR /app
ADD . /app
RUN npm install
