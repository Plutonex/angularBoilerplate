(function() {
    'use strict';
    /* global angular:false */
    angular.module('smartFormDirective', ['smartui.smartPanel'])

    .directive('sForm', ['$log',
        function($log) {

            $log.debug('sForm directive instantiated');

            return {

                restrict: 'E',
                transclude: true,
                replace: true,
                template: '<div class="smartForm" ng-show="isActive">' + '<div class="form-panel">' + '<form ng-submit="submit" class="form {{ formClass }}" ng-transclude>' + '</form>' + '</div>' + '</div>',
                require: '^sPanel',
                controller: ['$scope',
                    function($scope) {

                        $scope.isActive = false;
                        $scope.isNewDraft = false;

                        this.isActive = function() {
                            return $scope.isActive;
                        };

                        this.getValue = function(key) {
                            return $scope.item[key];
                        };

                        this.getSmartpanel = function() {
                            return $scope.smartpanel;
                        };

                        this.isNewDraft = function() {
                            return $scope.isNewDraft;
                        };

                        this.isEditable = function() {
                            return $scope.editable;
                        };

                        this.getCrudActions = function() {
                            return $scope.crudActions;
                        };

                        this.setValue = function(key, value) {
                            $scope.item[key] = value;
                        };

                        this.newForm = function() {
                            $scope.create();
                        };

                        this.editForm = function() {
                            if ($scope.item !== undefined && this.isActive()) {
                                $scope.edit();
                            }
                        };

                        this.saveForm = function() {
                            if ($scope.item !== undefined && this.isActive()) {
                                $scope.submit();
                            }
                        };

                        this.deleteForm = function() {
                            if ($scope.item !== undefined && this.isActive()) {
                                $scope.remove();
                            }
                        };

                        this.cancelForm = function() {
                            $scope.cancel();
                        };

                    }
                ],

                link: function(scope, element, attrs, smartPanel) {


                    scope.editable = false;
                    scope.draftOriginal = {};


                    scope.item = {}; //empty form data intially

                    scope.smartpanel = smartPanel.getService();
                    $log.debug('form fetched smartpanel');
                    $log.debug(scope.smartpanel);
                    scope.crudActions = scope.smartpanel.crudActions();

                    scope.smartpanel.onChange('lastSelected', function(formData) {
                        if (formData !== undefined) {
                            scope.isActive = true;
                            scope.isNewDraft = false;
                            scope.editable = false;

                            scope.$apply(function() {

                                scope.item = formData;

                                if (formData._original === undefined) {
                                    scope.item._original = angular.copy(formData);
                                }

                                scope.$broadcast('sForm_data_changed', formData);
                            });

                        } else {
                            scope.$apply(function() {
                                scope.isActive = false;
                            });

                        }
                    });


                    scope.smartpanel.onChange('newDraft', function(draftItem) {
                        if (draftItem !== undefined && draftItem.draftId !== undefined) {
                            scope.isActive = true;
                            scope.editable = true;
                            scope.isNewDraft = true;
                            scope.item = draftItem;

                            scope.$broadcast('sForm_data_changed', draftItem);
                        }
                    });

                    scope.reset = function() {
                        // scope.restore_original();
                        scope.editable = false;
                    };

                    scope.cancel = function() {

                        if (scope.item._cancelIsDelete !== undefined && scope.item._cancelIsDelete === true) {
                            //we delete the conflict item on cancel
                            scope.remove();
                            scope.reset();
                            scope.isActive = false;

                        } else {

                            //when modified existing data autosaved to offline, if cancelled, we then needs to delete the item from
                            //offline Storage
                            if (scope.item._offlineId !== undefined) {
                                scope.restoreOriginal();
                                scope.removeFromOffline();
                            }

                            if (scope.item.id === undefined) {
                                scope.restoreOriginal();
                            }
                            scope.reset();
                        }
                    };


                    scope.restoreOriginal = function() {
                        if (scope.item._original !== undefined) {
                            var originalContent = angular.copy(scope.item._original);

                            for (var key in scope.item) {
                                if (originalContent[key] !== undefined) {
                                    scope.item[key] = originalContent[key];
                                }
                            }

                            scope.$broadcast('sForm_data_restored', scope.item);
                        }
                    };

                    scope.addNewInTo = function(item) {
                        if (!angular.isArray(item)) {
                            item = [{}];
                        } else {
                            item.push({});
                        }
                    };


                    scope.removeItemFrom = function(index, item) {
                        delete item[index];
                    };


                    scope.edit = function() {
                        if (scope.crudActions.modify === true) {
                            if (scope.item._original === undefined) {
                                scope.item._original = angular.copy(scope.item);
                            }
                            //check if unsaved autoOffline already exists, if not
                            //we create a new autoSaveOffline tracker for the item.
                            //If we find the unsaved autoOffline version, we load it after prompting the user
                            if (scope.smartpanel.hasOfflineVersion(scope.item.id)) {

                                var promise = scope.smartpanel.confirmToRestoreOfflineVersion(scope.item);

                                promise.then(function(restoredItem) {

                                    for (var indx in restoredItem) {
                                        if (indx !== '_offlineId') {
                                            scope.item[indx] = restoredItem[indx];
                                        }

                                    }
                                    scope.$broadcast('sForm_data_restored', scope.item);
                                    scope.smartpanel.autoSaveOffline(scope.item);
                                    scope.editable = true;

                                }, function() {
                                    scope.smartpanel.autoSaveOffline(scope.item);
                                    scope.editable = true;
                                });

                            } else {

                                scope.smartpanel.autoSaveOffline(scope.item);
                                scope.editable = true;
                            }
                        }
                    };

                    scope.create = function() {
                        scope.newdraft();
                    };

                    scope.remove = function() {
                        var promise;

                        if (scope.item.id !== undefined) {
                            // if a saved draft, we check if the user has permission to delete
                            if (scope.crudActions.remove === true) {
                                promise = scope.smartpanel.remove(scope.item);
                            }

                        } else {
                            //only an unsaved draft can be deleted
                            promise = scope.smartpanel.remove(scope.item);
                        }

                        promise.then(function() {
                            //item removed
                            scope.reset();
                            scope.isActive = false;
                        }, function() {
                            // item was not removed
                            scope.reset();
                            scope.isActive = false;
                        });

                    };

                    scope.removeFromOffline = function() {
                        if (scope.item.id !== undefined) {
                            scope.smartpanel.removeOfflineVersion(scope.item.id);
                        }

                    };


                    scope.submit = function() {
                        var promise;
                        // if the object has an id, or both created and modified attributes, it is considered
                        // the object needs to be updated, else considered as a new object to be created.
                        if (scope.item.id !== undefined || (scope.item.updated_at !== undefined && scope.item.created_at !== undefined)) {

                            //update a new item
                            if (scope.crudActions.modify === true) {
                                promise = scope.smartpanel.save();

                                promise.then(function(savedItem) {

                                    scope.item = savedItem;
                                    scope.$broadcast('sForm_data_restored', savedItem);
                                    scope.reset();

                                }, function(panelResponse) {
                                    // was not able to save, so do nothing here
                                    if (panelResponse === 'offlineSaved') {
                                        scope.reset();
                                    }
                                });
                            }


                        } else {

                            //save a new item
                            if (scope.crudActions.create === true) {
                                promise = scope.smartpanel.save(scope.item, true);
                                promise.then(function(savedItem) {

                                    scope.item = savedItem;
                                    scope.$broadcast('sForm_data_restored', savedItem);
                                    scope.reset();

                                }, function(panelResponse) {
                                    if (panelResponse !== 'offlineSaved') {
                                        scope.item._cancelIsDelete = true;
                                    } else {
                                        scope.reset();
                                    }

                                });
                            }

                        }
                    };


                    scope.newdraft = function() {
                        if (scope.crudActions.create === true) {
                            scope.item = scope.smartpanel.newDraft();
                            scope.item.smf_new_record = true;
                        }
                    };


                }
            };

        }
    ]);

})();
