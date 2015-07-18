[![Build Status](https://travis-ci.org/innowatio/iwwa-lambda-standard-deviation.svg?branch=master)](https://travis-ci.org/innowatio/iwwa-lambda-standard-deviation)
[![Dependency Status](https://david-dm.org/innowatio/iwwa-lambda-standard-deviation.svg)](https://david-dm.org/innowatio/iwwa-lambda-standard-deviation)
[![devDependency Status](https://david-dm.org/innowatio/iwwa-lambda-standard-deviation/dev-status.svg)](https://david-dm.org/innowatio/iwwa-lambda-standard-deviation#info=devDependencies)

# WARNING

Dependency [`simple-statistics`](https://github.com/simple-statistics/simple-statistics/)
is pulled from `simple-statistics/simple-statistics#master`. When `1.0.0` is
released, remember to switch.

### Development

After cloning the repository, run `npm install` to install dependencies, and
`npm run dev` to start the development environment that runs tests and lints
source code on file save.

### Continuous Integration

The following environment variables have to be specified in the Travis project
settings:

- `ARTIFACTS_KEY`: AWS access key id
- `ARTIFACTS_SECRET`: AWS secret access key
- `ARTIFACTS_BUCKET`: S3 bucket name
- `ARTIFACTS_S3_REGION`: region of the S3 bucket
- `ARTIFACTS_TARGET_PATHS`: target folder(s)
- `FUNCTION_NAME`: lambda function name

**WARNING**: the value of those variables **must** be kept secret. **Do not**
set them in the `.travis.yml` config file, only in the Travis project's
settings (where they are kept secret).

Travis workflow:

- run tests
- lint source code
- build project into zip bundle
- upload bundle to S3

Once artifacts have been uploaded, one has to manually update the lambda
function with the desired bundle.
