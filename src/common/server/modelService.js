(function() {
    'use strict';
    /* global angular:false */
    angular.module('app.modelService', ['app.server'])

    //model service factory to provide model resources
    .service('modelService', ['$api', '$q',
        function($api, $q) {
            var prepareSelectList = function(data, labelField, idField) {
                var usergroups = [],
                    index;

                for (index in data) {
                    var item = data[index];
                    if (item.id !== undefined) {
                        usergroups.push({
                            id: item[idField],
                            label: item[labelField]
                        });
                    }

                }

                return usergroups;
            };


            var makeSelectListPromise = function(Api, labelField, idField) {
                var deferred,
                    promise;

                if (idField === undefined) {
                    idField = 'id';
                }

                //prepare a deferred promise
                deferred = $q.defer();
                promise = deferred.promise;

                var finalpromise = promise.then(function(data) {
                    return prepareSelectList(data, labelField, idField);
                });

                Api.query({}, function(data) {
                    deferred.resolve(data);
                });

                return finalpromise;
            };


            function mergeParams(param1, param2) {

                var index;

                if (param2 === undefined) {
                    return param1;
                }

                for (index in param2) {
                    param1[index] = param2[index];
                }

                return param1;
            }


            return {

                sample: function(params) {
                    params = mergeParams({
                        id: '@id'
                    }, params);

                    return $api('api/sample/:id', params);
                }



            };

        }
    ]);

})();
