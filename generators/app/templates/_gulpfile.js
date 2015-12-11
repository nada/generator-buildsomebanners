// DoubleClick HTML polite banner
// <%= creativeName %>

// the formats and languages used
var formats = [<%= creativeFormats %>];
var langs = [<%= creativeLanuages %>];

// dependencies
var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var minifyHTML = require('gulp-minify-html');
var minifyInline = require('gulp-minify-inline');
var rename = require('gulp-rename');
var del = require('del');
var connect = require('gulp-connect');
var open = require('gulp-open');
var zip = require('gulp-zip');
var runSequence = require('run-sequence');
var header = require('gulp-header');
var filesize = require('gulp-filesize');
var argv = require('yargs').argv;

// read in the package file
var pkg = require('./package.json');

var bannerName = '';

// Banner message to be appended to minified files
var nowDate = new Date();

var bannerMessageHtml = ['<!--',
    ' <%= openTag %> pkg.name %> - <%= openTag %> pkg.description %>',
    ' @version v<%= openTag %> pkg.version %>',
    ' @date ' + (nowDate.getMonth() + 1) + "-" + nowDate.getDate() + "-" + nowDate.getFullYear() + " at " + nowDate.getHours() + ":" + nowDate.getMinutes() + ":" + nowDate.getSeconds(),
    ' -->',
    ''
].join('\n');
var bannerMessageJsCss = ['/**',
    ' * <%= openTag %> pkg.name %> - <%= openTag %> pkg.description %>',
    ' * @version v<%= openTag %> pkg.version %>',
    ' * @date ' + (nowDate.getMonth() + 1) + "-" + nowDate.getDate() + "-" + nowDate.getFullYear() + " at " + nowDate.getHours() + ":" + nowDate.getMinutes() + ":" + nowDate.getSeconds(),
    ' */',
    ''
].join('\n');


// TASKS

// Uglify external JS files
gulp.task('uglify:dist', function() {
    var opt = {
        mangle: true, // make shorter variable names
        compress: {
            drop_debugger: true, // drop debugger messages from code
            drop_console: true // drop console messages from code
        },
        output: {
            beautify: false // make code pretty? default is false
        }
    };
    return gulp.src(bannerName + '/dev/script.js')
        .pipe(uglify(opt))
        .pipe(rename('script.js'))
        .pipe(header(bannerMessageJsCss, {
            pkg: pkg
        }))
        .pipe(gulp.dest(bannerName + '/dist/'));
});

// Uglify / Minify inline JS and CSS
gulp.task('minify-inline', function() {
    var opt = {
        js: { // options for inline JS
            mangle: true, // make shorter variable names
            compress: {
                drop_debugger: true, // drop debugger messages from code
                drop_console: true // drop console messages from code
            },
            output: {
                beautify: false // make code pretty? default is false
            }
        }
    };
    gulp.src(bannerName + '/dist/*.html')
        .pipe(minifyInline(opt))
        .pipe(gulp.dest(bannerName + '/dist/'))
});

gulp.task('sass:dev', function() {
    return gulp.src(bannerName + '/dev/style.scss')
        .pipe(sass({
            outputStyle: "expanded"
        }).on('error', sass.logError))
        .pipe(rename('style.css'))
        .pipe(gulp.dest(bannerName + '/dev'))
        .pipe(connect.reload());;
});

gulp.task('sass:dist', function() {
    return gulp.src(bannerName + '/dev/style.scss')
        .pipe(sass({
            outputStyle: "compressed"
        }).on('error', sass.logError))
        .pipe(header(bannerMessageJsCss, {
            pkg: pkg
        }))
        .pipe(rename('style.css'))
        .pipe(gulp.dest(bannerName + '/dist'));
});

gulp.task('minify-html', function() {
    var opts = {
        conditionals: true,
        spare: false
    };

    return gulp.src(bannerName + '/dist/*.html')
        .pipe(minifyHTML(opts))
        .pipe(header(bannerMessageHtml, {
            pkg: pkg
        }))
        .pipe(gulp.dest(bannerName + '/dist/'));
});

gulp.task('del', function() {
    del([
        bannerName + '/dist/*'
    ])
});

gulp.task('connect', function() {
    connect.server({
        root: [bannerName + '/dev'],
        port: 8889,
        livereload: true,
        //livereload: { port: '9999' }
    });
});

gulp.task('open', function() {
    var options = {
        uri: 'http://localhost:8889',
        app: 'Google Chrome'
            //app: 'firefox'
    };
    gutil.log('-----------------------------------------');
    gutil.log('Opening browser to:', gutil.colors.yellow('http://localhost:8889'));
    gutil.log('-----------------------------------------');
    gulp.src(__filename)
        .pipe(open(options));
});

gulp.task('copy-to-dist-folder', function() {
    return gulp.src([
      bannerName + '/dev/index.html',
      bannerName + '/dev/style.css',
      bannerName + '/dev/*.png',
      bannerName + '/dev/*.jpg',
      bannerName + '/dev/*.gif',
      bannerName + '/dev/script.js',
      bannerName + '/dev/*.min.js',
      '!' + bannerName + '/dev/comp*'])
        .pipe(gulp.dest(bannerName + '/dist'));
});

gulp.task('compress', function() {
    return gulp.src(bannerName + '/dist/*')
        // for quick access, you can change this
        // name at the top of this file
        .pipe(zip(bannerName+'.zip' ))
        .pipe(filesize())
        .pipe(gulp.dest(bannerName + '/delivery'));
});

/*
gulp.task('archive', function() {
    // make a zip all the files, including dev folder, for archiving the banner
   var success = gulp.src(['gulpfile.js', 'package.json', '*.sublime-project', 'dev/*', 'dist/*', 'delivery/*'], {cwdbase: true})
        // for quick access, you can change this
        // name at the top of this file
        .pipe(zip('archive-'+archiveName+'.zip'))
        .pipe(gulp.dest('archive'));
    gutil.log('--------------------------------');
    gutil.log('Your banner has been archived in');
    gutil.log('archive/'+ gutil.colors.yellow('archive-'+archiveName+'.zip') );
    gutil.log('--------------------------------');
    return success;
});
*/

gulp.task('basic-reload', function() {
    gulp.src(bannerName + '/dev')
        .pipe(connect.reload());
});

gulp.task('watch', function() {
    gulp.watch([bannerName + '/dev/*.html', bannerName + '/dev/*.js'], ['basic-reload']);
    gulp.watch([bannerName + '/dev/*.scss'], ['sass:dev']);
});

//internal
gulp.task('build-internal', function(callback) {
    runSequence('del', 'copy-to-dist-folder', ['minify-html'], ['minify-inline', 'sass:dist'], 'uglify:dist', ['compress'],
        callback);
});

gulp.task('serve', function(callback) {
    runSequence('sass:dev', ['connect'], ['open', 'watch'],
        callback);
});

// Depricated: no longer needed because
// it is part of the 'build' sequence now.
gulp.task('finalize', ['compress']);

gulp.task('help', function() {
    gutil.log(gutil.colors.red('buildabanner'), 'help');
    gutil.log('--------------------------');
    gutil.log('There are 3 basic commands.');
    gutil.log(gutil.colors.yellow('gulp dev -f [format] -l [language] '), ': for dev use, spins up server w livereload as you edit files for specified format and language');
    gutil.log(gutil.colors.yellow('gulp build -f [format] -l [language]'), ': minifies files from the dev directory of the specified format and language into the', gutil.colors.red('dist'), 'directory');
    gutil.log(gutil.colors.yellow('sh ./buildall.sh'), ': runs the build task on all formats');
    gutil.log('--------------------------');
});

//gulp.task('default', ['serve']);
gulp.task('default', ['help']);

gulp.task('dev', function(callback) {
  validateArguments();
  setBannerName(argv.f.toString(), argv.l.toString());
  runSequence('serve', callback);
});

gulp.task('build', function(callback) {
  validateArguments();
  setBannerName(argv.f.toString(), argv.l.toString());
  runSequence('build-internal', callback);
});


validateArguments = function() {
  var isValid = true;
  if(argv.f === undefined || formats.indexOf(argv.f.toString()) == -1) {
    gutil.log(gutil.colors.red('you have to specify a valid format parameter: ') + formats);
    isValid = false;
  }
  if(argv.l === undefined || langs.indexOf(argv.l.toString()) == -1) {
    gutil.log(gutil.colors.red('you have to specify a valid language parameter: ') + langs);
    isValid = false;
  }
  if(!isValid) {
    throw Error();  //TODO a real stop here
  }
}

setBannerName = function(f, l) {
  bannerName = f + "-" + l;
};
