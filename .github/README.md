[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=superflyxxi_phone-compare&metric=alert_status)](https://sonarcloud.io/dashboard?id=superflyxxi_phone-compare)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=superflyxxi_phone-compare&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=superflyxxi_phone-compare)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=superflyxxi_phone-compare&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=superflyxxi_phone-compare)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=superflyxxi_phone-compare&metric=security_rating)](https://sonarcloud.io/dashboard?id=superflyxxi_phone-compare)

[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=superflyxxi_phone-compare&metric=bugs)](https://sonarcloud.io/dashboard?id=superflyxxi_phone-compare)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=superflyxxi_phone-compare&metric=code_smells)](https://sonarcloud.io/dashboard?id=superflyxxi_phone-compare)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=superflyxxi_phone-compare&metric=duplicated_lines_density)](https://sonarcloud.io/dashboard?id=superflyxxi_phone-compare)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=superflyxxi_phone-compare&metric=sqale_index)](https://sonarcloud.io/dashboard?id=superflyxxi_phone-compare)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=superflyxxi_phone-compare&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=superflyxxi_phone-compare)

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
