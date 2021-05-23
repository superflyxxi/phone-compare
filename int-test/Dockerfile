ARG FROM_IMAGE=phone-compare
FROM ${FROM_IMAGE}
MAINTAINER SuperFlyXXI
ENV NODE_ENV=test
ENTRYPOINT ["npm"]
CMD ["run", "int-test"]
RUN npm install
ADD int-test /app/int-test
