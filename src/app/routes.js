(function() {

    'use strict';

    angular.module('app.routes', [
        // all the app routes dependencies here
    ])

    .config(['$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {

            $stateProvider.state('root', {

                url: '/',
                abstract: true,
                views: {
                    '@': {
                        templateUrl: 'templates/root.tpl.html',
                        controller: 'mainCtrl'
                    }
                },

                data: {
                    pageTitle: 'Home'
                }
            });

            $urlRouterProvider.otherwise('/');

        }
    ]);
})();
