FROM node:23.3-alpine3.19
LABEL org.opencontainers.image.authors="SuperFlyXXI <superflyxxi@yahoo.com>"
EXPOSE 3000
ENV 	NODE_ENV=production \
	DATA_DIR=/data
RUN mkdir ${DATA_DIR}
WORKDIR /app
ENTRYPOINT ["npm"]
CMD ["start"]
ADD package* /app/
RUN npm ci --omit=dev
ADD src /app/src
