(function() {
    'use strict';
    /* global angular:false */
    angular.module('app.storage', ['storageFactoryModule'])

    .provider('appStorage', function() {

        var config = {};
        config.key = 'storage';
        config.prefix = '';
        config.order = ['local', 'session', 'memory'];
        config.errorName = 'appStorage.notification.error';

        /**
         * Provider Configuration method gives access to configure
         * @param  {string} key
         * @param  {mixed} value
         * @return void
         */
        this.configure = function(key, value) {
            if (config[key] !== undefined) {
                config[key] = value;
            }
        };


        /**
         * When service instance called, it returns a new instance of of storage with configuration
         * @param  {[type]} appStorageFactory [description]
         * @return {[type]}                   [description]
         */
        this.$get = ['storageFactory', '$log',
            function(storageFactory, $log) {

                var Storage = storageFactory.create(config);
                return Storage;

            }
        ];

    });


})();
