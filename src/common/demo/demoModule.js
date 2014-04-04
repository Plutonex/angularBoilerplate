(function() {
    'use strict';

    /* global angular */
    angular.module('demoModule', ['ngMockE2E'])

    .run(['$httpBackend', 'appConfig',
        function($httpBackend, appConfig) {
            var allUrlPattern = /^.*$/i;

            var allowEverything = function() {
                $httpBackend.whenGET(allUrlPattern).passThrough();
                $httpBackend.whenPOST(allUrlPattern).passThrough();
                $httpBackend.whenPUT(allUrlPattern).passThrough();
                $httpBackend.whenPATCH(allUrlPattern).passThrough();
                $httpBackend.whenJSONP(allUrlPattern).passThrough();
                $httpBackend.whenDELETE(allUrlPattern).passThrough();

                return;
            };

            if (appConfig.get('demo') !== true) {
                allowEverything();
                return;
            }

            var hostUrl = appConfig.get('server');



            var items = [{
                firstname: 'Tom',
                lastname: 'Hammer'
            }, {
                firstname: 'Ahmed',
                lastname: 'Mohamed'
            }];

            // returns the current list of items
            $httpBackend.whenGET(hostUrl + '/api/sample').respond(items);

            // adds a new item to the items array
            //$httpBackend.whenPOST('/resource/pending-reservations').respond(function(method, url, data) {
            //items.push(angular.fromJson(data));
            //});

            //$httpBackend.whenGET(/^\/templates\//).passThrough();

            allowEverything();

            return;
        }
    ]);

})();
