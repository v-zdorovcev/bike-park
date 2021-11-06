import gulp from 'gulp';
import del from 'del';
import newer from 'gulp-newer';
import plumber from 'gulp-plumber';
import concat from 'gulp-concat';
import rename from 'gulp-rename';
import imagemin from 'gulp-imagemin';
import svgmin from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import objectFit from 'postcss-object-fit-images';
import minify from 'gulp-csso';
import uglify from 'gulp-uglify';
import server from 'browser-sync';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';

const sass = gulpSass(dartSass);

export const clean = () => {
  return del('build');
};

export const copy = () => {
  return gulp
    .src(['src/assets/fonts/**/*.{woff,woff2}', 'src/assets/img/*.webp', 'src/js/*'], {
      base: 'src',
    })
    .pipe(gulp.dest('build'));
};

export const images = () => {
  return gulp
    .src(['src/assets/img/**/*.{png,jpg,svg}', '!src/assets/icons/sprite/*.svg'])
    .pipe(newer('build/img'))
    .pipe(
      imagemin([
        imagemin.optipng({
          optimizationLevel: 3,
        }),
        imagemin.mozjpeg({
          progressive: true,
        }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
            },
          ],
        }),
      ]),
    )
    .pipe(gulp.dest('build/img'));
};

export const sprite = () => {
  return gulp
    .src('src/assets/icons/sprite/*.svg')
    .pipe(
      svgmin({
        plugins: [
          {
            removeViewBox: false,
          },
        ],
      }),
    )
    .pipe(
      svgstore({
        inlineSvg: true,
        removeAttrs: { attrs: '(stroke|fill)' },
      }),
    )
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
};

export const style = () => {
  return gulp
    .src('src/sass/style.scss')
    .pipe(plumber())
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(postcss([autoprefixer(), objectFit()]))
    .pipe(gulp.dest('build/css'))
    .pipe(minify())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
};

export const scripts = () => {
  return gulp
    .src(['src/js/*.js'])
    .pipe(plumber())
    .pipe(concat('script.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(uglify())
    .pipe(
      rename({
        suffix: '.min',
      }),
    )
    .pipe(gulp.dest('build/js'));
};

export const html = () => {
  return gulp.src('src/*.html').pipe(plumber()).pipe(gulp.dest('build'));
};

export const refresh = (done) => {
  server.reload();
  done();
};

export const watch = () => {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false,
    port: 9999,
  });

  gulp.watch('src/assets/img/**/*', gulp.series(images, refresh));
  gulp.watch('src/assets/icons/sprite/*.svg', gulp.series(sprite, refresh));
  gulp.watch('src/sass/**/*.scss', gulp.series(style));
  gulp.watch('src/js/**/*.js', gulp.series(scripts, refresh));
  gulp.watch('src/**/*.html', gulp.series(html, refresh));
};

export default gulp.series(
  gulp.parallel(clean, html, style, scripts, images, sprite, copy),
  gulp.series(watch),
);
