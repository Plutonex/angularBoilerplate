(function() {

    angular.module('app.home', [])

    .config(['$stateProvider',
        function($stateProvider) {

            $stateProvider.state('root.home', {
                url: 'home/',
                views: {
                    'main': {
                        templateUrl: 'home/view.tpl.html',
                        controller: 'homeController'
                    }
                }
            })
                .state('root.home.child', {
                    url: 'child',
                    views: {
                        'child': {
                            templateUrl: 'home/test.tpl.html'
                        }
                    }
                });
        }
    ])

    .controller('homeController', ['$scope', 'modelService',
        function($scope, modelService) {
            $scope.message = "welcome to home page";

            $scope.api = modelService.sample();

        }
    ]);

})();
