ARG FROM_IMAGE=node:14-alpine3.11
FROM ${FROM_IMAGE}
EXPOSE 3000
MAINTAINER SuperFlyXXI
ENV 	NODE_ENV=production \
	DATA_DIR=/data
RUN mkdir ${DATA_DIR}
WORKDIR /app
ENTRYPOINT ["npm"]
CMD ["start"]
ADD package* /app/
RUN npm install
ADD src /app/src
