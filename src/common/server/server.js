(function() {
    'use strict';
    /* global angular:false */
    angular.module('app.server', ['ngResource'])

    .factory('$api', ['appConfig', '$resource',
        function(appConfig, $resource) {

            return function(url, params, methods) {

                var FullUrl,
                    CustomHeaders,
                    defaults,
                    resource;

                FullUrl = appConfig.get('server') + '/' + url;

                CustomHeaders = {
                    'x-domain': 'x-domain'
                };

                defaults = {
                    'update': {
                        method: 'PUT',
                        isArray: false,
                        withCredentials: true
                    },
                    'create': {
                        method: 'POST',
                        withCredentials: true
                    },
                    'get': {
                        method: 'GET',
                        withCredentials: true,
                        headers: CustomHeaders
                    },
                    'query': {
                        method: 'GET',
                        isArray: true,
                        withCredentials: true,
                        headers: CustomHeaders
                    },
                    'remove': {
                        method: 'DELETE',
                        withCredentials: true
                    },
                    'delete': {
                        method: 'DELETE',
                        withCredentials: true
                    },
                    'check': {
                        method: 'HEAD',
                        withCredentials: true
                    },
                    'post_query': {
                        method: 'POST',
                        withCredentials: true,
                        isArray: true
                    }
                };

                angular.extend(defaults, methods);

                resource = $resource(FullUrl, params, defaults);

                resource.prototype.$save = function() {
                    if (!this.id) {
                        return this.$create();

                    } else {
                        return this.$update();
                    }
                };


                return resource;


            };
        }
    ]);

})();
