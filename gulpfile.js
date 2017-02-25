var del = require("del");
var gulp = require("gulp");
var merge = require("merge2");
var mocha = require("gulp-mocha");
var runSequence = require("run-sequence");
var sourcemaps = require("gulp-sourcemaps");
var ts = require("gulp-typescript");
var tslint = require("gulp-tslint");

gulp.task("clean", function () {
    return del([
        "lib/*"
    ]);
});

gulp.task("tslint", function () {
    return gulp
        .src(["src/**/*.ts", "!src/**/*.d.ts"])
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report());
});

gulp.task("tsc", function () {
    var tsProject = ts.createProject("tsconfig.json");
    var tsResult = tsProject
        .src()
        .pipe(sourcemaps.init())
        .pipe(tsProject());

    return merge([
        tsResult.js
            .pipe(sourcemaps.write())
            .pipe(gulp.dest("lib")),
        tsResult.dts.pipe(gulp.dest("lib"))
    ]);
});

gulp.task("watch", ["tsc"], function () {
    gulp.watch("src/**/*.ts", ["tsc"]);
});

gulp.task("src", function (callback) {
    runSequence(["tslint", "tsc"], callback);
});

gulp.task("default", function (callback) {
    runSequence("clean", "src", callback);
});
