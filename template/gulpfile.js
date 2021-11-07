import gulp from 'gulp';
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
import sync from 'browser-sync';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';

const sass = gulpSass(dartSass);

export const copy = () => {
  return gulp
    .src(['src/fonts/**/*.{woff,woff2}', 'src/img/*.webp', 'src/js/*'], {
      base: 'src',
    })
    .pipe(gulp.dest('build'))
    .pipe(
      sync.stream({
        once: true,
      }),
    );
};

export const images = () => {
  return gulp
    .src(['src/img/**/*.{png,jpg,svg}', '!src/icons/sprite/*.svg'])
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
    .pipe(gulp.dest('build/img'))
    .pipe(sync.stream());
};

export const sprite = () => {
  return gulp
    .src('src/icons/sprite/*.svg')
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
    .pipe(gulp.dest('build/icons'))
    .pipe(sync.stream());
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
    .pipe(sync.stream());
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
    .pipe(gulp.dest('build/js'))
    .pipe(sync.stream());
};

export const html = () => {
  return gulp.src('src/*.html').pipe(plumber()).pipe(gulp.dest('build')).pipe(sync.stream());
};

export const server = () => {
  sync.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false,
    port: 9999,
  });
};

export const watch = () => {
  gulp.watch('src/**/*.html', gulp.series(html));
  gulp.watch('src/sass/**/*.scss', gulp.series(style));
  gulp.watch('src/js/**/*.js', gulp.series(scripts));
  gulp.watch('src/img/**/*', gulp.series(images));
  gulp.watch('src/icons/sprite/*.svg', gulp.series(sprite));
  gulp.watch(['src/fonts/**/*.{woff,woff2}', 'src/img/*.webp', 'src/js/*'], gulp.series(copy));
};

export default gulp.series(
  gulp.parallel(copy, images, sprite, style, scripts, html),
  gulp.parallel(watch, server),
);
