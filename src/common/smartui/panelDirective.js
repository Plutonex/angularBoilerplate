(function() {
    'use strict';
    /* global angular:false */
    angular.module('smartPanelDirective', ['smartui.smartPanel'])

    .directive('sPanel', ['$smartPanel', '$log',
        function($smartPanel, $log) {

            return {

                restrict: 'E',
                transclude: true,
                replace: true,
                template: '<div class"smartPanel" ng-transclude></div>',
                scope: {
                    resource: '=',
                    name: '@'
                },

                controller: ['$scope', '$element', '$attrs',
                    function($scope, $element, $attrs) {
                        console.log('PANEL NAME == ' + $scope.name);
                        console.log($scope.resource);

                        if ($attrs.resource !== undefined) {
                            $log.debug('create new smartpanel ' + $scope.name);
                            $scope.smartPanel = $smartPanel.$new($scope.name, $scope.resource);
                        } else {
                            $log.debug('fetch existing smartpanel ' + $scope.name);
                            $scope.smartPanel = $smartPanel.$get($scope.name);
                        }


                        this.getService = function() {
                            return $scope.smartPanel;
                        };

                    }
                ]
            };

        }
    ]);

})();
