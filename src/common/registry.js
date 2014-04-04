(function() {
    'use strict';
    /* global angular:false */
    angular.module('app.registry', [])

    .service('Registry', ['RegistryCacheFactory', 'appConfig',
        function(RegistryCacheFactory, appConfig) {

            var RegKeyRoot = appConfig.get('registry_id'),
                RegObj = new RegistryCacheFactory(RegKeyRoot);
            return RegObj;

        }
    ])


    .factory('RegistryCacheFactory', ['$cacheFactory',
        function($cacheFactory) {

            var cachedItems = {};

            var RegistryFactoryClass = function(regID) {
                var cache;

                if (cachedItems[regID] !== undefined) {
                    cache = cachedItems[regID];
                } else {
                    cache = $cacheFactory(regID);
                    cachedItems[regID] = cache;
                }


                return {
                    set: function(key, value) {
                        return cache.put(key, value);
                    },

                    get: function(key) {
                        return cache.get(key);
                    },

                    remove: function(key) {
                        cache.remove(key);
                    },

                    empty: function() {
                        cache.removeAll();
                    },

                    destroy: function() {
                        cache.destroy();
                    }
                };


            };

            return RegistryFactoryClass;
        }
    ]);

})();
