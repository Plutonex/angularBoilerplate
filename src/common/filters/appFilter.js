(function() {
    'use strict';
    /* global angular:false */
    angular.module('app.filterModules', [])

    .factory('appFilter', ['$log',
        function() {

            var RegisteredFilters = {};

            return {
                make: function(name, callback) {
                    RegisteredFilters[name] = callback;
                },

                run: function(name) {

                    //split arguments in filter name
                    var parts = name.split('|');
                    var filter_name = parts[0];
                    var args;

                    if (parts.length === 2) {
                        args = parts[1].split(',');
                    }

                    if (RegisteredFilters[filter_name]) {
                        var callback = RegisteredFilters[filter_name];

                        // Uncomment the following to invoke callback, passing parameters individually (i.e. as opposed to passing all parameters in a single array).
                        return callback.apply(callback, args);


                    }

                    return false;
                }
            };

        }
    ]);

})();
