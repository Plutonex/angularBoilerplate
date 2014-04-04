(function() {
    'use strict';
    /* global angular:false */
    angular.module('app.smartDraftStorage', ['storageFactoryModule'])

    .provider('draftStorage', function() {

        var config = {};
        config.key = 'smartDrafts';
        config.prefix = '';
        config.order = ['local', 'session', 'memory'];
        config.errorName = 'appStorage.notification.error';

        /**
         * Provider Configuration method gives access to configure
         * @param  {string} key
         * @param  {mixed} value
         * @return void
         */

        function configure(key, value) {
            if (config[key] !== undefined) {
                config[key] = value;
            }
        }

        this.configure = function(key, value) {
            configure(key, value);
        };


        /**
         * When service instance called, it returns a new instance of of storage with configuration
         * @param  {[type]} appStorageFactory [description]
         * @return {[type]}                   [description]
         */
        this.$get = ['storageFactory',
            function(storageFactory) {


                return {
                    setPrefix: function(draftId) {
                        if (config.prefix !== undefined) {
                            config.prefix = draftId + '_';
                        }
                    },

                    create: function(keyID) {
                        if (keyID !== undefined) {
                            this.setPrefix(keyID);
                        }
                        var Storage = storageFactory.create(config);
                        return Storage;
                    }
                };

            }
        ];

    });

})();
