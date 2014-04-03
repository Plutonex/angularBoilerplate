(function() {
    /* global angular */

    'use strict';

    /**
     * Common Modules available to use throughout the app. This can be libraries, custom directives, services etc.
     */
    angular.module('app.common', [

        // put all the library module dependencies here
    ])


    /**
     * App configurator service provider, which works as a memory to setup global configurations.
     * @return {object} appConfig
     */
    .provider('appConfig', function() {

        this.config = {};

        this.set = function(key, value) {
            this.config[key] = value;
        };

        this.$get = ['$rootScope',
            function($rootScope) {

                var ConfigScope = $rootScope.$new();
                ConfigScope.data = this.config;

                return {
                    get: function(key) {
                        return ConfigScope.data[key];
                    }
                };
            }
        ];

    });

})();
