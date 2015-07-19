import {promisify} from "bluebird";
import {execSync} from "child_process";
import {createReadStream} from "fs";
import gulp from "gulp";
import babel from "gulp-babel";
import eslint from "gulp-eslint";
import mocha from "gulp-spawn-mocha";
import zip from "gulp-zip";
import proGulp from "pro-gulp";
import {Lambda, S3} from "aws-sdk";

var AWS_DEFAULT_REGION  = process.env.AWS_DEFAULT_REGION;
var TRAVIS_BRANCH       = process.env.TRAVIS_BRANCH;
var TRAVIS_COMMIT       = process.env.TRAVIS_COMMIT;
var TRAVIS_PULL_REQUEST = process.env.TRAVIS_PULL_REQUEST;
var TRAVIS_TAG          = process.env.TRAVIS_TAG;
var LAMBDA_HANDLER      = "index.handler";
var LAMBDA_NAME         = process.env.LAMBDA_NAME;
var LAMBDA_ROLE_ARN     = process.env.LAMBDA_ROLE_ARN;
var S3_BUCKET           = process.env.S3_BUCKET;

var BUNDLE_NAME = [
    LAMBDA_NAME,
    "branch_" + TRAVIS_BRANCH,
    "commit_" + TRAVIS_COMMIT,
    TRAVIS_TAG && "tag_" + TRAVIS_TAG,
    TRAVIS_PULL_REQUEST !== "false" && "pr_" + TRAVIS_PULL_REQUEST,
    "bundle.zip"
].filter(e => !!e).join("-");

proGulp.task("compile", function () {
    return gulp.src("src/**/*.js")
        .pipe(babel())
        .pipe(gulp.dest("build/" + TRAVIS_COMMIT + "/"));
});

proGulp.task("install", function () {
    execSync("cp package.json build/" + TRAVIS_COMMIT + "/package.json");
    execSync("npm install --production", {
        cwd: "build/" + TRAVIS_COMMIT + "/"
    });
});

proGulp.task("bundle", function () {
    return gulp.src("build/" + TRAVIS_COMMIT + "/**/*")
        .pipe(zip(BUNDLE_NAME))
        .pipe(gulp.dest("build/"));
});

proGulp.task("uploadToS3", function () {
    var s3 = new S3({
        apiVersion: "2006-03-01",
        region: AWS_DEFAULT_REGION
    });
    var params = {
        Bucket: S3_BUCKET,
        Key: BUNDLE_NAME,
        Body: createReadStream("build/" + BUNDLE_NAME)
    };
    return promisify(s3.upload, s3)(params);
});

proGulp.task("updateLambda", function () {
    var lambda = new Lambda({
        apiVersion: "2015-03-31",
        region: AWS_DEFAULT_REGION
    });
    var createParams = {
      Code: {
        S3Bucket: S3_BUCKET,
        S3Key: BUNDLE_NAME
      },
      FunctionName: LAMBDA_NAME + "_" + TRAVIS_BRANCH,
      Handler: LAMBDA_HANDLER,
      Role: LAMBDA_ROLE_ARN,
      Runtime: "nodejs"
    };
    var updateParams = {
        FunctionName: LAMBDA_NAME + "_" + TRAVIS_BRANCH,
        S3Bucket: S3_BUCKET,
        S3Key: BUNDLE_NAME
    };
    return promisify(lambda.createFunction, lambda)(createParams)
        .catch(function (e) {
            console.log("ERR");
            console.log(e);
            return promisify(lambda.updateFunctionCode, lambda)(updateParams);
        });
});

gulp.task("updateLambda", proGulp.task("updateLambda"));
gulp.task("deploy", proGulp.sequence([
    "compile",
    "install",
    "bundle",
    "uploadToS3",
    "updateLambda"
]));

gulp.task("test", function () {
    return gulp.src(["test/**/*.js"])
        .pipe(mocha({
            compilers: "js:babel/register",
            env: {
                NODE_ENV: "test",
                NODE_PATH: "./src/"
            },
            istanbul: true
        }));
});

gulp.task("lint", function () {
    return gulp.src(["src/**/*.js"])
        .pipe(eslint())
        .pipe(eslint.format());
});

gulp.task("default", ["test", "lint"], function () {
    return gulp.watch(["src/**/*.js", "test/**/*.js"], ["test", "lint"]);
});
