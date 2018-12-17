'use strict';
var conf = require('./config.json'),
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    cleanCSS = require('gulp-clean-css'),
    rename = require("gulp-rename"),

    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    twig = require('gulp-twig'),
    plumber = require('gulp-plumber'),

    //jslint = require('gulp-jslint'),
    // iconfont = require('gulp-iconfont'),
    // consolidate = require('gulp-consolidate'),
    runTimestamp = Math.round(Date.now() / 1000),
    runSequence = require('run-sequence'),
    del = require('del'),
    browserSync = require('browser-sync').create(),
    spawn = require('child_process').spawn,
    node;


gulp.task('watch', function() {
    // watching scripts/scss/twig/html files 
    gulp.watch("shared/scss/**/*.scss", ['sass']);
    gulp.watch("shared/scripts/**/*.js", ['footerscripts', browserSync.reload]);
    gulp.watch("shared/twig/**/*.{twig,tpl,html}", ['twig', browserSync.reload]);
});

gulp.task('clean', function() {
    // Return the Promise from del() 
    return del(conf.dest.js);
});

// Compile sass into CSS & auto-inject into browsers

gulp.task('sass', function() {
    return gulp.src([
            'shared/scss/*.scss'
        ])
        //.pipe(sourcemaps.init()) 
        .pipe(sass().on('error', sass.logError))
        //.pipe(sourcemaps.write("app/maps/"))
        .pipe(gulp.dest(conf.dest.css))
        //.pipe(gulp.dest('../Development/Unibail.Web/css/'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest(conf.dest.css))
        // .pipe(gulp.dest('../Development/Unibail.Web/css/'))
        .pipe(browserSync.stream());
});


gulp.task('vendor', function() {
    return gulp.src(conf.vendor.src)
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest(conf.dest.js))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(conf.dest.js));
});

gulp.task('footerscripts', function() {
    // Minify and copy all JavaScript (except vendor scripts)
    return gulp.src(conf.fscripts.src)
        .pipe(plumber())
        .pipe(concat('footerscripts.js'))
        .pipe(gulp.dest(conf.dest.js))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(conf.dest.js));
});

gulp.task('twig', function() {
    'use strict';
    return gulp.src('shared/twig/*.twig')
        .pipe(twig())
        .pipe(gulp.dest('app/'));
});



gulp.task('server', function() {
    if (node) node.kill()
    node = spawn('node', ['gulpfile.js'], { stdio: 'inherit' })
    node.on('close', function(code) {
        if (code === 8) {
            gulp.log('Error detected, waiting for changes...');
        }
    });
})


gulp.task('default', function(cb) {
    // Static Server
    runSequence(['watch', 'sass', 'vendor', 'footerscripts', 'twig'],
        cb);
    browserSync.init({
        server: {
            baseDir: ['./app'],
            port: 80
        }
    })
});

process.on('exit', function() {
    if (node) node.kill()
})