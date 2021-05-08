# phone-compare
Tools to compare phones

## Running
`docker run -p <yourport>:3000 <image>`

### Environment Variables

name | description | example
--- | --- | ---
`DATA_DIR` | The directory where all data will be stored. | `/data`

## API Documentation
The documentation can be found via [Swagger UI](http://localhost:3000/api-docs).

In general, you'll want to provide this service with your 
[phone](/v1/phones/manufacturers/{manufacturers}/models/{model}). Provide the required information. Then you can call
[compare](/v1/phones/compare) with the ranking of attributes. The phones in the system will be scored and returned.
