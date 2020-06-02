var gulp = require('gulp');
var exec = require('child_process').exec;
var clean = require('gulp-clean');
var gulpSequence = require('gulp-sequence');
var tslint = require("gulp-tslint");

gulp.task('default', gulp.series( tslinter, cleaner, compile, copy, start ));

gulp.task('build', gulp.series( tslinter, cleaner, compile, copy ));

function tslinter() {
    return gulp.src(['./**/*.ts', '!./node_modules/**', '!./typings/**'])
        .pipe(tslint({
            configuration: "./tslint.json"
        }))
        .pipe(tslint.report({
            summarizeFailureOutput: true
        }));
};

function copy(done) {
    return gulp.src(['./**/*.json', '!./node_modules/**'])
        .pipe(gulp.dest('./dist'));
};

function cleaner() {
    return gulp.src(['./dist/*'])
        .pipe(clean());
};

function start(done) {
    exec('nodemon --delay 1000ms dist/index', (err, stdOut, stdErr) => {
        console.log(stdOut);
        if (err) {
            done(err);
        } else {
            done();
        }
    });
    console.log('Server started!');
    gulp.watch([
        './**/*.ts',
        '!./node_modules/**/*.ts'
    ], gulp.series( compile, copy ));
    console.log('Watcher activated!');    
};

function compile(done) {
    exec('tsc', function (err, stdOut, stdErr) {
        console.log(stdOut);
        if (err) {
            done(err);
        } else {
            done();
        }
    });
};
