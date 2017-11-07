var gulp = require("gulp");
var babel = require("gulp-babel");
var mustache = require("gulp-mustache");
var connect = require("gulp-connect");
var sourcemap = require("gulp-sourcemaps");
var browserify = require('browserify');
var transform = require('vinyl-transform');

gulp.task("javascript",function(){
  return gulp.src("client/javascript/*.js")
    .pipe(sourcemap.init())
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(sourcemap.write())
    .pipe(gulp.dest("build/js"))
});

gulp.task("html", function(){
  return gulp.src("client/templates/*.mustache")
    .pipe(sourcemap.init())
    .pipe(mustache({},{extension:".html"},{}))
    .pipe(sourcemap.write())
    .pipe(gulp.dest("build"))
});

gulp.task("server", function(){
  connect.server({
    root: 'build',
    livereload: true
  });
});

gulp.task("watch", function(){
  gulp.watch(['./client/templates/*.mustache'],['html']);
  gulp.watch(['./client/javascript/*.js'],['javascript']);
});


gulp.task('default', ['server', 'watch']);
