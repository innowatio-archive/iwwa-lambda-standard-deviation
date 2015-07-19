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

- `AWS_ACCESS_KEY_ID`
- `AWS_DEFAULT_REGION`
- `AWS_SECRET_ACCESS_KEY`
- `LAMBDA_ROLE_ARN`: ARN of the IAM role to give the lambda function
- `LAMBDA_NAME`: lambda function name
- `S3_BUCKET`

**WARNING**: the value of those variables **must** be kept secret. **Do not**
set them in the `.travis.yml` config file, only in the Travis project's
settings (where they are kept secret).

Travis workflow:

- run tests
- lint source code
- build project into zip bundle
- upload bundle to S3
- create/update the lambda function

If the lambda function does not exist, the script creates it. However, it does
not configure event sources and other parameters. Manual intervention is
therefore required.
