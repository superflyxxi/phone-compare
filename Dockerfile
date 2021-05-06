ARG NODE_VERSION=14
FROM node:${NODE_VERSION}-alpine3.13
EXPOSE 3000
MAINTAINER SuperFlyXXI
ENV 	NODE_ENV=production \
	DATA_DIR=/data
RUN mkdir ${DATA_DIR}
WORKDIR /app
ENTRYPOINT ["npm"]
CMD ["start"]
ADD . /app
RUN npm install
