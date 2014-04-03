/**
 * This file/module contains all configuration for the build process.
 */
/* global module */
module.exports = {
    /**
     * The `build_dir` folder is where our projects are compiled during
     * development and the `compile_dir` folder is where our app resides once it's
     * completely built.
     */
    build_dir: 'build',
    compile_dir: 'bin',

    /**
     * The deployment git repository
     */
    git_deploy_remote: 'git@github.com:raftalks/ngInit.git',
    git_deploy_branch: 'master',


    app_files: {
        js: ['src/**/*.js', '!src/**/*.spec.js', '!src/assets/**/*.js'],
        jsunit: ['src/**/*.spec.js'],

        atpl: ['src/app/**/*.tpl.html'],
        ctpl: ['src/common/**/*.tpl.html'],

        html: ['src/index.html'],
        less: ['src/less/main.less', 'src/common/**/*.less', 'src/app/**/*.less']
    },

    /**
     * This is a collection of files used during testing only.
     */
    test_files: {
        js: [
            'vendor/angular-mocks/angular-mocks.js'
        ]
    },



    vendor_files: {
        js: [
            'vendor/es5-shim/es5-shim.js',
            'vendor/es5-shim/es5-sham.js',
            'vendor/modernizr/modernizr.js',
            'vendor/jquery/jquery.js',
            'vendor/angular/angular.js',
            'vendor/angular-bootstrap/ui-bootstrap-tpls.js', //ui-bootstrap-tpls.min.js',
            'vendor/angular-dynamic-locale/src/tmhDinamicLocale.js',
            'vendor/angular-resource/angular-resource.js',
            'vendor/angular-cookies/angular-cookies.js',
            'vendor/angular-ui-router/release/angular-ui-router.js',
            'vendor/angular-sanitize/angular-sanitize.js',
            'vendor/angular-mocks/angular-mocks.js',
            'vendor/CryptoJS_v3.1.2.zip/components/core.js',
            'vendor/CryptoJS_v3.1.2.zip/components/md5.js',
            'vendor/bootstrap/js/collapse.js',
            'vendor/bootstrap/js/tabs.js',
            'vendor/angular-loading-bar/src/loading-bar.js',
            'vendor/momentjs/moment.js'
        ],
        css: [
            'vendor/angular-loading-bar/src/loading-bar.css'
        ],
        assets: [
            'vendor/font-awesome/fonts/*',
            'vendor/bootstrap/dist/fonts/*'
        ],

        i18n: [
            'vendor/angular-i18n/angular-locale_en-gb.js'
        ]
    },
};
