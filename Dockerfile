FROM node:16.13.0-alpine3.11
LABEL org.opencontainers.image.authors="SuperFlyXXI <superflyxxi@yahoo.com>"
EXPOSE 3000
ENV 	NODE_ENV=production \
	DATA_DIR=/data
RUN mkdir ${DATA_DIR}
WORKDIR /app
ENTRYPOINT ["npm"]
CMD ["start"]
ADD package* /app/
RUN npm install
ADD src /app/src
