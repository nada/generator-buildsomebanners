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
            'Welcome to the 2 ' + chalk.bold.red('buildsomebanners') + ' generator!'
        ));

        var bannerSizes = [];
        var bannerLanguages = [];

        var prompts = [{
            type: 'input',
            name: 'projectName',
            filter: function(answer) { return camelCase(answer) },
            message: 'Project name (no spaces):',
            default: this.appname
        }, {
            type: 'input',
            name: 'projectDesc',
            message: 'Description:',
            default: 'ACME banners'
        }, {
            type: 'list',
            name: 'projectType',
            message: 'What type of banners are these?',
            choices: ['DoubleClick', 'Standard'],
            default: 'DoubleClick'
        }, {
            type: 'checkbox',
            name: 'bannerSizes',
            message: 'Choose all sizes needed.',
            choices: ['300x250', '728x90', '160x600', '300x600', '320x50'],
            default: [],
            validate: function(inp) {
              if(inp.length === 0) {
                return 'Please choose at least one format';
              }
              return true;
            }
        }, {
            type: 'checkbox',
            name: 'bannerLanguages',
            message: 'Choose all lanugages needed.',
            choices: ['de', 'fr', 'it', 'en'],
            default: ['de'],
            validate: function(inp) {
              if(inp.length === 0) {
                return 'Please choose at least one language';
              }
              return true;
            }
        }, {
            type: 'confirm',
            name: 'includeGsap',
            message: 'Include GSAP for offline use?',
            default: false
        }, {
            when: function (answers) {
                return answers.projectType === 'DoubleClick';
              }, type: 'confirm',
              name: 'includeOfflineEnabler',
              message: "Include DoubleClick Enabler for offline use?",
              default: true
        }/*, {
            type: 'confirm',
            name: 'includeSublimeProject',
            message: 'Include SublimeText project file?',
            default: true
        }, {
            type: 'input',
            name: 'archiveName',
            message: 'Ad zip archive name? (Do not include .zip)',
            default: function(answers) {
                return answers.bannerName + "-" + answers.bannerSize
            }
        }*/];

        this.prompt(prompts, function(props) {
            this.props = props;
            // To access props later use this.props.someOption;

            done();
        }.bind(this));
    },

    writing: {
        app: function() {
            var bannerSuffix;
            switch(this.props.projectType) {
                case "DoubleClick":
                bannerSuffix = "_dc";
                break;
                case "Standard":
                default:
                bannerSuffix = "_standard"
            }
            var projectType = this.props.projectType;
            var packageOptions = {
                projectName: this.props.projectName,
                projectDesc: this.props.projectDesc,
                bannerSizes: this.props.bannerSizes,
                bannerLanguages: this.props.bannerLanguages
            }
            this.fs.copyTpl(
                this.templatePath('_package.json'),
                this.destinationPath('package.json'),
                packageOptions
            );
            // process and copy the gulpfile
            var gulpfileOptions = {
                creativeName: this.props.projectName,
                creativeFormats: '\'' + this.props.bannerSizes.join('\',\'') + '\'',
                creativeLanuages: '\'' + this.props.bannerLanguages.join('\',\'') + '\'',
                openTag: '<%='
            }
            this.fs.copyTpl(
                this.templatePath('_gulpfile.js'),
                this.destinationPath('gulpfile.js'),
                gulpfileOptions
            );

            // create the folder structure
            var shBuildCommands = [];

            for(var size of this.props.bannerSizes) {
                for(var lang of this.props.bannerLanguages) {

                    //add the shell commands
                    shBuildCommands.push('gulp build -f '+size+' -l ' +lang);

                    var bannerWidth = parseInt(size.split('x')[0]);
                    var bannerHeight = parseInt(size.split('x')[1]);
                    var destPathPrefix = size + '-' +lang + '/';

                    // copy only select contents from the 'dev' folder
                    this.fs.copy(
                        this.templatePath('dev/!(_index.html|_*.*|*.src)'),
                        this.destinationPath(destPathPrefix + 'dev')
                    );
                    var scriptOptions = {
                        projectName: this.props.projectName,
                        projectDesc: this.props.projectDesc,
                        bannerSize: size,
                        bannerLanguage: lang
                    }
                    this.fs.copyTpl(
                        this.templatePath('dev/_banner.js'),
                        this.destinationPath(destPathPrefix + 'dev/banner.js'),
                        scriptOptions
                    );
                    // process and copy the dev/index.html
                    var indexOptions = {
                        projectName: this.props.projectName,
                        bannerWidth: bannerWidth,
                        bannerHeight: bannerHeight
                    }
                    this.fs.copyTpl(
                        this.templatePath('dev/_index' + bannerSuffix + '.html'),
                        this.destinationPath(destPathPrefix + 'dev/index.html'),
                        indexOptions
                    );
                    // process and copy the dev/style.scss
                    var styleOptions = {
                        bannerWidth: bannerWidth,
                        bannerHeight: bannerHeight
                    }
                    this.fs.copyTpl(
                        this.templatePath('dev/_banner.scss'),
                        this.destinationPath(destPathPrefix + 'dev/banner.scss'),
                        styleOptions
                    );
                }
            }

            //write the buildall shellscript
            var shOptions = {
                projectName: this.props.projectName,
                buildCommands: shBuildCommands.join('\n'),
                openTag: '<%='
            }
            this.fs.copyTpl(
                this.templatePath('_buildall.sh'),
                this.destinationPath('buildall.sh'),
                shOptions
            );

            //write the README
            var readmeOptions = {
                projectName: this.props.projectName,
                devCommands: shBuildCommands.map(function(cmd){return cmd.replace('build', 'dev')}).join('\n'),
                buildCommands: shBuildCommands.join('\n'),
                openTag: '<%='
            }
            this.fs.copyTpl(
                this.templatePath('_README.md'),
                this.destinationPath('README.md'),
                readmeOptions
            );

            /*
            // copy the SublimeText project file
            if (this.props.includeSublimeProject == true) {
                this.fs.copy(
                    this.templatePath('_bannerbuilder.sublime-project'),
                    this.destinationPath(this.props.bannerName+'.sublime-project')
                );
            }
            */

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
            this.fs.copy(
                this.templatePath('gitignore'),
                this.destinationPath('.gitignore')
            );
            this.fs.copy(
                this.templatePath('common/common.scss'),
                this.destinationPath('common/common.scss')
            );
            var bannerSuffix;
            switch(this.props.projectType) {
                case "DoubleClick":
                bannerSuffix = "_dc";
                break;
                case "Standard":
                default:
                bannerSuffix = "_standard"
            }
            this.fs.copy(
                this.templatePath('common/_common' + bannerSuffix + '.js'),
                this.destinationPath('common/common.js')
            );
        }
    },


    install: function() {
        if (this.props.includeGsap === true) {
            this.npmInstall(['gsap'], {
                'saveDev': true
            });
        };

        this.npmInstall();
    },

    end: function() {
        this.log('\n');
        this.log(chalk.bold.yellow('------------------------------------'));
        this.log(chalk.bold.yellow('|  Start by entering \'') + chalk.bold.blue('gulp') + chalk.bold.yellow('\' below  |'));
        this.log(chalk.bold.yellow('------------------------------------'));
        this.log(' ');
        this.log(chalk.bold.red('For help: gulp help'));
    }
});
