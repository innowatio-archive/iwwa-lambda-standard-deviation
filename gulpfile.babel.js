import {promisifyAll} from "bluebird";
import {execSync} from "child_process";
import {createReadStream} from "fs";
import gulp from "gulp";
import babel from "gulp-babel";
import eslint from "gulp-eslint";
import mocha from "gulp-spawn-mocha";
import zip from "gulp-zip";
import proGulp from "pro-gulp";
import {Lambda, S3} from "aws-sdk";

promisifyAll(Lambda.prototype, {suffix: "Promise"});
promisifyAll(S3.prototype, {suffix: "Promise"});

function getOutput (command) {
    try {
        return execSync(command).toString("utf8").trim();
    } catch (ignore) {
        return null;
    }
}

var CURRENT_BRANCH = getOutput("git rev-parse --abbrev-ref HEAD");
var CURRENT_COMMIT = getOutput("git rev-parse --short HEAD");
var CURRENT_TAG = getOutput("git describe --exact-match HEAD");
var LAMBDA_HANDLER = "index.handler";
var LAMBDA_NAME = process.env.LAMBDA_NAME;
var LAMBDA_ROLE = process.env.LAMBDA_ROLE;
var S3_BUCKET = process.env.S3_BUCKET;

var BUNDLE_NAME = [
    LAMBDA_NAME,
    CURRENT_TAG && "tag_" + CURRENT_TAG,
    "branch_" + CURRENT_BRANCH,
    "commit_" + CURRENT_COMMIT,
    "bundle.zip"
].filter(e => !!e).join("-");

proGulp.task("compile", function () {
    return gulp.src("src/**/*.js")
        .pipe(babel())
        .pipe(gulp.dest("build/" + CURRENT_COMMIT + "/"));
});

proGulp.task("install", function () {
    execSync("cp package.json build/" + CURRENT_COMMIT + "/package.json");
    execSync("npm install --production", {
        cwd: "build/" + CURRENT_COMMIT + "/"
    });
});

proGulp.task("bundle", function () {
    return gulp.src("build/" + CURRENT_COMMIT + "/**/*")
        .pipe(zip(BUNDLE_NAME))
        .pipe(gulp.dest("build/"));
});

proGulp.task("uploadToS3", function () {
    var s3 = new S3({apiVersion: "2006-03-01"});
    var params = {
        Bucket: S3_BUCKET,
        Key: BUNDLE_NAME,
        Body: createReadStream("build/" + BUNDLE_NAME)
    };
    return s3.uploadPromise(params);
});

proGulp.task("updateLambda", function () {
    var lambda = new Lambda({apiVersion: "2015-03-31"});
    var createParams = {
      Code: {
        S3Bucket: S3_BUCKET,
        S3Key: BUNDLE_NAME
      },
      FunctionName: LAMBDA_NAME + "_" + CURRENT_BRANCH,
      Handler: LAMBDA_HANDLER,
      Role: LAMBDA_ROLE,
      Runtime: "nodejs"
    };
    var updateParams = {
        FunctionName: LAMBDA_NAME + "_" + CURRENT_BRANCH,
        S3Bucket: S3_BUCKET,
        S3Key: BUNDLE_NAME
    };
    return lambda.createFunctionPromise(createParams)
        .catch(function () {
            return lambda.updateFunctionCodePromise(updateParams);
        });
});

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
