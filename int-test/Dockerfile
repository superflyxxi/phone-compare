ARG FROM_IMAGE=phone-compare
FROM ${FROM_IMAGE}
ENV NODE_ENV=test
RUN npm install
ENTRYPOINT ["npm"]
CMD ["run", "int-test"]
ADD int-test /app/int-test
