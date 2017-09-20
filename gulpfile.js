var gulp = require("gulp");
var runSequence = require("run-sequence");

gulp.task("clean", function () {
    var del = require("del");

    return del([
        "lib/*"
    ]);
});

gulp.task("tslint", function () {
    var gulpTslint = require("gulp-tslint");
    var tslint = require("tslint");

    var program = tslint.Linter.createProgram("./tsconfig.json");

    return gulp
        .src("src/**/*.ts")
        .pipe(gulpTslint({
            formatter: "stylish",
            program
        }))
        .pipe(gulpTslint.report());
});

gulp.task("tsc", function () {
    var sourcemaps = require("gulp-sourcemaps");
    var ts = require("gulp-typescript");
    var merge = require("merge2");

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
