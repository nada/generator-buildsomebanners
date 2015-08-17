'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var Download = require('download');
var camelCase = require('camelcase');

module.exports = yeoman.generators.Base.extend({
    prompting: function() {
        var done = this.async();

        // Have Yeoman greet the user.
        this.log(yosay(
            'Welcome to the ' + chalk.bold.red('buildabanner') + ' generator!'
        ));

        var bannerSize = 'default';

        var prompts = [{
            type: 'input',
            name: 'bannerName',
            filter: function(answer) { return camelCase(answer) },
            message: 'Banner name (camelCase):',
            default: this.appname
        }, {
            type: 'input',
            name: 'bannerDesc',
            message: 'Description:',
            default: 'An HTML banner'
        }, {
            type: 'list',
            name: 'bannerSize',
            message: 'Choose a size for this banner.',
            choices: ['300x250', '728x90', '160x600', '300x600'],
            default: '300x250'
        }, {
            type: 'confirm',
            name: 'includeGsap',
            message: 'Include GSAP for offline use?',
            default: true
        }, {
            type: 'confirm',
            name: 'includeOfflineEnabler',
            message: 'Include DoubleClick Enabler for offline use?',
            default: true
        }, {
            type: 'confirm',
            name: 'includeSublimeProject',
            message: 'Include SublimeText project file?',
            default: true
        }, {
            type: 'input',
            name: 'archiveName',
            message: 'When this ad is zipped, what should it be called? ',
            default: function(answers) {
                return answers.bannerName + "-" + answers.bannerSize + ".zip"
            }
        }];

        this.prompt(prompts, function(props) {
            /* Set the width and height properites based on bannerSize */
            switch (props.bannerSize) {
                case '300x600':
                    props.bannerWidth = 298;
                    props.bannerHeight = 598;
                    break;
                case '728x90':
                    props.bannerWidth = 726;
                    props.bannerHeight = 88;
                    break;
                case '160x600':
                    props.bannerWidth = 158;
                    props.bannerHeight = 598;
                    break;
                case '300x250':
                default:
                    props.bannerWidth = 298;
                    props.bannerHeight = 248;
                    break;
            }

            this.props = props;
            // To access props later use this.props.someOption;

            done();
        }.bind(this));
    },

    writing: {
        app: function() {
            var packageOptions = {
                bannerName: this.props.bannerName,
                bannerSize: this.props.bannerSize,
                bannerDesc: this.props.bannerDesc
            }
            this.fs.copyTpl(
                this.templatePath('_package.json'),
                this.destinationPath('package.json'),
                packageOptions
            );
            // process and copy the gulpfile
            var gulpfileOptions = {
                creativeName: this.props.bannerName,
                archiveName: this.props.archiveName,
                openTag: '<%='
            }
            this.fs.copyTpl(
                this.templatePath('_gulpfile.js'),
                this.destinationPath('gulpfile.js'),
                gulpfileOptions
            );
            // copy only select contents from the 'dev' folder
            this.fs.copy(
                this.templatePath('dev/!(_index.html|_*.*|*.src)'),
                this.destinationPath('dev')
            );
            // process and copy the dev/index.html
            var indexOptions = {
                title: this.props.bannerName
            }
            this.fs.copyTpl(
                this.templatePath('dev/_index.html'),
                this.destinationPath('dev/index.html'),
                indexOptions
            );
            // process and copy the dev/style.scss
            var styleOptions = {
                bannerWidth: this.props.bannerWidth,
                bannerHeight: this.props.bannerHeight
            }
            this.fs.copyTpl(
                this.templatePath('dev/_style.scss'),
                this.destinationPath('dev/style.scss'),
                styleOptions
            );
            // copy the SublimeText project file
            if (this.props.includeSublimeProject == true) {
                this.fs.copy(
                    this.templatePath('_bannerbuilder.sublime-project'),
                    this.destinationPath('bannerbuilder.sublime-project')
                );
            }

            if (this.props.includeOfflineEnabler == true) {

                new Download({
                        mode: '755'
                    })
                    .get('https://s0.2mdn.net/ads/studio/Enabler.js')
                    .dest('offline')
                    .run();
            }
        },

        projectfiles: function() {
            this.fs.copy(
                this.templatePath('editorconfig'),
                this.destinationPath('.editorconfig')
            );
            this.fs.copy(
                this.templatePath('jshintrc'),
                this.destinationPath('.jshintrc')
            );
        }
    },


    install: function() {
        if (this.props.includeGsap == true) {
            this.npmInstall(['gsap'], {
                'saveDev': true
            });
        };

        this.npmInstall();
    },

    end: function() {
        this.log('\n');
        this.log(chalk.bold.yellow('************************************'));
        this.log(chalk.bold.yellow('*  Start by entering \'') + chalk.bold.blue('gulp') + chalk.bold.yellow('\' below  *'));
        this.log(chalk.bold.yellow('************************************'));
        this.log(' ');
        this.log(chalk.bold.red('Now go build a that banner.'));
    }
});
