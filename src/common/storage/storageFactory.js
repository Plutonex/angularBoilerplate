/**
 * storageFactoryModule for AngularJS
 *
 * The MIT License
 * Copyright (c) 2013 Raftalks (Rahmathullah Abdul Faththah)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
(function() {
    'use strict';
    /* global angular:false, Modernizr:false */
    angular.module('storageFactoryModule', [])

    /**
     * Storage Factory Service
     * Which is responsible in creating new storage items
     * @param  {object} $rootScope
     * @param  {object} $log
     * @return {object}
     */
    .factory('storageFactory', ['$rootScope', '$log',
        function($rootScope, $log) {

            $log.debug('storageFactory Instance called');
            /**
             * Return a new Storage Object, and if data exists in the keyname,
             * the new object is restored with existing data
             */

            function getStorage(options, keyname, errorName) {

                var FirstOption = options[0],
                    SecondOption = options[1],
                    LastOption = options[2],
                    storage;

                var checkOptionAvailable = function(option) {

                    var response = false;
                    switch (option) {

                        case 'session':
                            if (Modernizr.sessionstorage) {
                                response = true;
                            }
                            break;

                        case 'local':
                            if (Modernizr.localstorage) {
                                response = true;
                            }
                            break;

                        case 'memory':
                            response = true;
                            break;

                        default:
                            response = false;
                            break;
                    }

                    return response;
                };

                //check if first option is valid
                if (checkOptionAvailable(FirstOption)) {
                    storage = createStorageObject(keyname, FirstOption, errorName);
                } else if (checkOptionAvailable(SecondOption)) {
                    storage = createStorageObject(keyname, SecondOption, errorName);
                } else {
                    storage = createStorageObject(keyname, LastOption, errorName);
                }

                return storage;
            }



            /**
             * Create a localStorage/sessionStorage object and maintains all the updates within the scope
             * of the given keyname
             * @param  {string} keyname scope of the storage
             * @return {object
             */

            function createStorageObject(keyname, driverType, errorName) {

                function StorageClassObj(keyName, driver) {


                    var dataScope = $rootScope.$new(true);
                    dataScope.indexId = keyName;
                    dataScope.syncAll = true;


                    function syncStorage(newData, oldData) {


                        var stringData,
                            storeValue;

                        switch (driver) {

                            case 'session':

                                //create from data already stored in the session if exist
                                try {
                                    /**
                                     * If dataScope.dataset is initially created, we check if the same key already exist in sessionStorage and is populated
                                     */
                                    if (dataScope.dataset === undefined) {
                                        dataScope.syncAll = false;
                                        stringData = sessionStorage.getItem(dataScope.indexId);
                                        if (stringData == null) {
                                            dataScope.dataset = {};
                                        } else {
                                            dataScope.dataset = angular.fromJson(stringData);
                                        }
                                        dataScope.syncAll = true;

                                    } else {

                                        storeValue = newData;
                                        sessionStorage.setItem(dataScope.indexId, storeValue);
                                    }

                                } catch (e) {
                                    dataScope.syncAll = false;
                                    dataScope.dataset = oldData;
                                    dataScope.syncAll = true;
                                    return errorShout(e, errorName);
                                }

                                break;

                            case 'local':

                                //create from data already stored in the localstorage if exist
                                try {
                                    /**
                                     * If dataScope.dataset is initially created, we check if the same key already exist in localstorage and is populated
                                     */
                                    if (dataScope.dataset === undefined) {
                                        dataScope.syncAll = false;
                                        stringData = localStorage.getItem(dataScope.indexId);
                                        if (stringData == null) {
                                            dataScope.dataset = {};
                                        } else {
                                            dataScope.dataset = angular.fromJson(stringData);
                                        }
                                        dataScope.syncAll = true;

                                    } else {
                                        storeValue = newData;
                                        localStorage.setItem(dataScope.indexId, storeValue);
                                    }

                                } catch (e) {
                                    dataScope.syncAll = false;
                                    dataScope.dataset = oldData;
                                    dataScope.syncAll = true;
                                    return errorShout(e, errorName);
                                }

                                break;

                            default:
                                // use memory, which is already existing, if not we create empty slot
                                if (dataScope.dataset === undefined) {
                                    dataScope.dataset = {};
                                }

                                break;
                        }



                    }

                    syncStorage(); // initialize by syncing the dataScope.dataset with localstorage


                    $rootScope.$watch(function() {
                        if (angular.isObject(dataScope.dataset)) {
                            return angular.toJson(dataScope.dataset);
                        }

                        return dataScope.dataset;

                    }, function(newValue, oldValue) {
                        if (dataScope.syncAll === true) {
                            syncStorage(newValue, oldValue);
                        }
                    });

                    return {

                        put: function(key, value) {
                            dataScope.dataset[key] = value;
                        },

                        get: function(key) {

                            if (dataScope.dataset !== undefined && dataScope.dataset[key] !== undefined) {
                                return dataScope.dataset[key];
                            }

                            return null;
                        },

                        hasKey: function(key) {
                            if (dataScope.dataset !== undefined && dataScope.dataset[key] !== undefined) {
                                return true;
                            }
                            return false;
                        },

                        all: function() {
                            return dataScope.dataset;
                        },

                        remove: function(key) {
                            if (dataScope.dataset !== undefined && dataScope.dataset[key] !== undefined) {
                                delete dataScope.dataset[key];
                            }
                        },

                        destroy: function() {
                            dataScope.dataset = {};
                            dataScope.$destroy();
                        },

                        count: function() {
                            var c = 0;
                            for (var indx in dataScope.dataset) {
                                c++;
                            }
                            return c;
                        }

                    };

                }

                return new StorageClassObj(keyname, driverType);
            }


            /**
             * Helper method, broadcasts an error notification on exceptions.
             * @param  {object} error     Error object returned from the exception
             * @param  {string} errorName Error event broadcasting name
             * @return void
             */

            function errorShout(error, errorName) {

                $rootScope.$broadcast(errorName, error.title + ': ' + error.message);
            }


            return {
                create: function(configdata) {

                    var keyName = configdata.prefix + configdata.key;
                    return getStorage(configdata.order, keyName, configdata.errorName);
                }
            };

        }
    ]);

})();
