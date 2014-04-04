(function() {

    'use strict';

    /* global angular */
    angular.module('app', ['ui.bootstrap', 'ui.router', 'app.common', 'app.routes', 'templates-app', 'templates-common'])

    .config(['appConfigProvider', '$logProvider',
        function(appConfigProvider, $logProvider) {

            $logProvider.debugEnabled(true);

            appConfigProvider.set('server', 'http://api.domain.com');
            appConfigProvider.set('registry_id', 'app_reg');

        }
    ])


    .controller('mainCtrl', ['$scope', '$log',
        function($scope, $log) {

            // main controller 

            // do your magic here

        }
    ]);

})();
