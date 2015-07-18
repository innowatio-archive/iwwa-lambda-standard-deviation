import {execSync} from "child_process";
import gulp from "gulp";
import babel from "gulp-babel";
import eslint from "gulp-eslint";
import mocha from "gulp-spawn-mocha";
import zip from "gulp-zip";
import proGulp from "pro-gulp";

var FUNCTION_NAME = process.env.FUNCTION_NAME;
var DESCRIPTION = execSync("git describe").toString("utf8").trim();

var bundleName = [FUNCTION_NAME, DESCRIPTION, "bundle.zip"].join("-");

proGulp.task("compile", function () {
    return gulp.src("src/**/*.js")
        .pipe(babel())
        .pipe(gulp.dest("build/" + DESCRIPTION + "/"));
});

proGulp.task("install", function () {
    execSync("cp package.json build/" + DESCRIPTION + "/package.json");
    execSync("npm install --production", {
        cwd: "build/" + DESCRIPTION + "/"
    });
});

proGulp.task("bundle", function () {
    return gulp.src("build/" + DESCRIPTION + "/**/*")
        .pipe(zip(bundleName))
        .pipe(gulp.dest("build/"));
});

proGulp.task("clean", function () {
    execSync("rm -r build/" + DESCRIPTION + "/");
});

gulp.task("build", proGulp.sequence(["compile", "install", "bundle", "clean"]));

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
