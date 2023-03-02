FROM node:19.7-alpine3.16
LABEL org.opencontainers.image.authors="SuperFlyXXI <superflyxxi@yahoo.com>"
EXPOSE 3000
ENV 	NODE_ENV=production \
	DATA_DIR=/data
RUN mkdir ${DATA_DIR}
WORKDIR /app
ENTRYPOINT ["npm"]
CMD ["start"]
ADD package* /app/
RUN npm ci
ADD src /app/src
