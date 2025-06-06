FROM node:22.16.0
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
