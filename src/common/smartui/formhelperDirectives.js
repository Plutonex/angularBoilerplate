(function() {
    'use strict';

    /* global angular:false  */
    angular.module('smartForm.helperDirectives', ['smartFormDirective', 'objectHelperModule'])


    .directive('sInput', ['objHelper', '$log',
        function(objHelper) {

            var defaultTemplate = '<div class="form-group">' +
                '<label  for="{{ name }}">{{ label }}</label>' +
                '<input  type="{{ type }}" name="{{ name }}" ng-model="inputValue" class="form-control" ng-disabled="isDisabled"/>' +
                '</div>';
            return {
                restrict: 'E',
                replace: true,
                template: defaultTemplate,

                scope: {
                    name: '@',
                    label: '@',
                    type: '@',
                    min: '@',
                    max: '@',
                    required: '@'
                },
                require: '^sForm',

                link: function(scope, element, attr, parentCtrl) {


                    scope.isDisabled = true;
                    scope.isEditable = false;

                    //check if editable form
                    scope.$watch(function() {
                        return parentCtrl.isEditable();
                    }, function(isEditable) {
                        scope.isEditable = isEditable;
                    });


                    var InputElement = element.find('input');

                    // //check if editable form
                    scope.$watch('isEditable', function(currentState) {
                        if (currentState === true) {
                            // InputElement.attr('disabled', false);
                            scope.isDisabled = false;

                            if (attr.disableOn !== undefined && attr.disableOn === 'update') {
                                if (parentCtrl.isNewDraft() !== true) {
                                    scope.isDisabled = true;
                                } else {
                                    scope.isDisabled = false;
                                }
                            }

                            if (attr.disableOn !== undefined && attr.disableOn === 'create') {

                                if (parentCtrl.isNewDraft() === true) {
                                    scope.isDisabled = true;
                                } else {
                                    scope.isDisabled = false;
                                }

                            }

                        } else {
                            // InputElement.attr('disabled', true);
                            scope.isDisabled = true;
                        }
                    });


                    scope.inputValue = null;

                    scope.$on('sForm_data_changed', function(evt, formData) {
                        var setValue = objHelper.getObjectAttr(formData, attr.name);
                        scope.inputValue = setValue;
                    });

                    scope.$watch('inputValue', function(value) {
                        parentCtrl.setValue(scope.name, value);
                    });

                    scope.$on('sForm_data_restored', function(evt, formData) {
                        var setValue = objHelper.getObjectAttr(formData, attr.name);
                        scope.inputValue = setValue;
                    });

                    //apply attributes to input element
                    if (scope.min !== undefined) {
                        InputElement.attr('min', scope.min);
                    }

                    if (scope.max !== undefined) {
                        InputElement.attr('max', scope.max);
                    }

                    if (scope.required !== undefined) {
                        InputElement.attr('required', true);
                    }


                }
            };
        }
    ])


    .directive('sSelectList', ['objHelper',
        function(objHelper) {

            var defaultTemplate = '<div class="smart-select-list">' +
                '<label ng-if="label" ng-bind="label"></label>' +
                '<ul>' +
                '<li ng-repeat="item in listData">' +
                '<input ng-disabled="isDisabled" type="checkbox" ng-click="clickedCheckbox(item)" ng-checked="isChecked(item)" /> {{item.label}}' +
                '</li>' +
                '</ul>' +
                '</div>';

            return {
                restrict: 'E',
                replace: true,
                template: defaultTemplate,
                scope: {
                    listData: '=',
                    label: '@',
                    name: '@'
                },

                require: '^sForm',
                link: function(scope, element, attr, parentCtrl) {

                    scope.isDisabled = true;
                    scope.inputValueTitle = 'model';

                    scope.inputValue = [];

                    //check if editable form
                    scope.$watch(function() {
                        return parentCtrl.isEditable();
                    }, function(isEditable) {
                        scope.isEditable = isEditable;
                    });

                    // check if editable form
                    scope.$watch('isEditable', function(currentState) {
                        if (currentState === true) {
                            // InputElement.attr('disabled', false);
                            scope.isDisabled = false;

                            if (attr.disableOn !== undefined && attr.disableOn === 'update') {
                                if (parentCtrl.isNewDraft() !== true) {
                                    scope.isDisabled = true;
                                } else {
                                    scope.isDisabled = false;
                                }
                            }

                            if (attr.disableOn !== undefined && attr.disableOn === 'create') {

                                if (parentCtrl.isNewDraft() === true) {
                                    scope.isDisabled = true;
                                } else {
                                    scope.isDisabled = false;
                                }
                            }

                        } else {
                            // InputElement.attr('disabled', true);
                            scope.isDisabled = true;
                        }
                    });

                    scope.clickedCheckbox = function(item) {
                        var index = scope.inputValue.indexOf(item.id);

                        if (index > -1) {
                            //already checked, so we uncheck by removing the index
                            scope.inputValue.splice(index, 1);
                        } else {
                            //not checked, we add id
                            scope.inputValue.push(item.id);
                        }
                    };

                    scope.isChecked = function(item) {
                        if (scope.inputValue !== undefined) {
                            return (scope.inputValue.indexOf(item.id) > -1);
                        } else {
                            scope.inputValue = [];
                            console.log('set inputValue to array');
                        }
                        return false;
                    };


                    scope.$on('sForm_data_changed', function(evt, formData) {
                        var setValue = objHelper.getObjectAttr(formData, attr.name);
                        scope.inputValue = setValue;
                    });

                    scope.$watch('inputValue', function(value) {
                        parentCtrl.setValue(scope.name, value);
                    });

                    scope.$on('sForm_data_restored', function(evt, formData) {
                        var setValue = objHelper.getObjectAttr(formData, attr.name);
                        scope.inputValue = setValue;
                    });

                }
            };
        }
    ])




    //has many related items within this
    .directive('sHasMany', ['objHelper',
        function(objHelper) {
            var defaultTemplate = '<div class="collection-list">' +
                '<label ng-if="label" ng-bind="label"></label>' +
                '<div id="content" ng-transclude></div>' +
                '</div>';
            return {
                restrict: 'E',
                replace: true,
                template: defaultTemplate,
                transclude: true,
                scope: {
                    label: '@',
                    isChildOf: '=',
                    inputValue: '=ngModel',
                    uses: '='
                },
                require: '^sForm',
                link: function(scope, element, attr, parentCtrl, transclude) {

                    scope.isDisabled = true;

                    //check if editable form
                    scope.$watch(function() {
                        return parentCtrl.isEditable();
                    }, function(isEditable) {
                        scope.isEditable = isEditable;
                    });


                    // //check if editable form
                    scope.$watch('isEditable', function(currentState) {
                        if (currentState === true) {
                            // InputElement.attr('disabled', false);
                            scope.isDisabled = false;

                            if (attr.disableOn !== undefined && attr.disableOn === 'update') {
                                if (parentCtrl.isNewDraft() !== true) {
                                    scope.isDisabled = true;
                                } else {
                                    scope.isDisabled = false;
                                }
                            }

                            if (attr.disableOn !== undefined && attr.disableOn === 'create') {

                                if (parentCtrl.isNewDraft() === true) {
                                    scope.isDisabled = true;
                                } else {
                                    scope.isDisabled = false;
                                }

                            }

                        } else {
                            // InputElement.attr('disabled', true);
                            scope.isDisabled = true;
                        }
                    });

                    scope.addItem = function() {
                        if (scope.inputValue !== undefined && angular.isArray(scope.inputValue)) {

                            scope.inputValue.push({});
                        } else {

                            scope.inputValue = [];
                            scope.inputValue.push({});
                        }

                    };

                    scope.removeItem = function(item) {
                        var indx = scope.inputValue.indexOf(item);
                        scope.inputValue.splice(indx, 1);
                    };


                    transclude(scope, function(clone) {
                        var contentElement = element.find('#content');
                        contentElement.replaceWith(clone);
                    });


                }
            };
        }
    ])


    .directive('sCheckbox', ['objHelper',
        function(objHelper) {

            var defaultTemplate = '<div class="checkbox">' +
                '<label>' +
                '<input type="checkbox" ng-model="inputValue" ng-disabled="isDisabled" ng-true-value="1" ng-false-value="0" ng-checked="inputValue === 1"/> {{ label }}' +
                '</label>' +
                '</div>';

            return {
                restrict: 'E',
                replace: true,
                template: defaultTemplate,

                scope: {
                    name: '@',
                    label: '@',
                    type: '@',
                    min: '@',
                    max: '@',
                    required: '@'
                },
                require: '^sForm',

                link: function(scope, element, attr, parentCtrl) {


                    scope.isDisabled = true;
                    scope.isEditable = false;

                    //check if editable form
                    scope.$watch(function() {
                        return parentCtrl.isEditable();
                    }, function(isEditable) {
                        scope.isEditable = isEditable;
                    });


                    var InputElement = element.find('input');

                    // //check if editable form
                    scope.$watch('isEditable', function(currentState) {
                        if (currentState === true) {
                            // InputElement.attr('disabled', false);
                            scope.isDisabled = false;

                            if (attr.disableOn !== undefined && attr.disableOn === 'update') {
                                if (parentCtrl.isNewDraft() !== true) {
                                    scope.isDisabled = true;
                                } else {
                                    scope.isDisabled = false;
                                }
                            }

                            if (attr.disableOn !== undefined && attr.disableOn === 'create') {

                                if (parentCtrl.isNewDraft() === true) {
                                    scope.isDisabled = true;
                                } else {
                                    scope.isDisabled = false;
                                }

                            }

                        } else {
                            // InputElement.attr('disabled', true);
                            scope.isDisabled = true;
                        }
                    });


                    scope.inputValue = null;

                    scope.$on('sForm_data_changed', function(evt, formData) {
                        var setValue = objHelper.getObjectAttr(formData, attr.name);
                        scope.inputValue = setValue;
                    });

                    scope.$watch('inputValue', function(value) {
                        parentCtrl.setValue(scope.name, value);
                    });

                    scope.$on('sForm_data_restored', function(evt, formData) {
                        var setValue = objHelper.getObjectAttr(formData, attr.name);
                        scope.inputValue = setValue;
                    });

                    //apply attributes to input element
                    if (scope.min !== undefined) {
                        InputElement.attr('min', scope.min);
                    }

                    if (scope.max !== undefined) {
                        InputElement.attr('max', scope.max);
                    }

                    if (scope.required !== undefined) {
                        InputElement.attr('required', true);
                    }


                }
            };
        }
    ])

    .directive('sGroupSelect', ['objHelper',
        function(objHelper) {
            var InnerTemplate = '<label for="name" ng-bind="label"></label>' +
                '<select class="form-control" ng-disabled="isDisabled" ng-model="inputValue" ng-options="option[option_label] group by option[group_by] for option in options track by option.id"></select>';
            return {
                restrict: 'E',
                replace: true,
                template: '<div class="form-group">' + InnerTemplate + '</div>',
                scope: {
                    name: '@',
                    label: '@',
                    option_label: '@optionLabel',
                    option_value: '@optionValue',
                    group_by: '@groupBy',
                    options: '='
                },
                require: '^sForm',

                link: function(scope, element, attr, parentCtrl) {

                    scope.inputValue = null;
                    scope.isDisabled = true;

                    scope.isEditable = false;

                    //check if editable form
                    scope.$watch(function() {
                        return parentCtrl.isEditable();
                    }, function(isEditable) {
                        scope.isEditable = isEditable;
                    });

                    var InputElement = element.find('select');

                    // //check if editable form
                    scope.$watch('isEditable', function(currentState) {
                        if (currentState === true) {
                            // InputElement.attr('disabled', false);
                            scope.isDisabled = false;

                            if (attr.disableOn !== undefined && attr.disableOn === 'update') {
                                if (parentCtrl.isNewDraft() !== true) {
                                    scope.isDisabled = true;
                                } else {
                                    scope.isDisabled = false;
                                }
                            }

                            if (attr.disableOn !== undefined && attr.disableOn === 'create') {

                                if (parentCtrl.isNewDraft() === true) {
                                    scope.isDisabled = true;
                                } else {
                                    scope.isDisabled = false;
                                }

                            }

                        } else {
                            // InputElement.attr('disabled', true);
                            scope.isDisabled = true;
                        }
                    });

                    if (attr.notEditable !== undefined) {
                        InputElement.attr('disabled', true);
                    }

                    scope.$on('sForm_data_changed', function(evt, formData) {
                        var setValue = objHelper.getObjectAttr(formData, attr.name);
                        scope.inputValue = setValue;
                    });

                    scope.$watch('inputValue', function(value) {
                        parentCtrl.setValue(scope.name, value);
                    });

                    scope.$on('sForm_data_restored', function(evt, formData) {
                        var setValue = objHelper.getObjectAttr(formData, attr.name);
                        scope.inputValue = setValue;
                    });

                    //apply attributes to input element
                    if (scope.min !== undefined) {
                        InputElement.attr('min', scope.min);
                    }

                    if (scope.max !== undefined) {
                        InputElement.attr('max', scope.max);
                    }

                    if (scope.required !== undefined) {
                        InputElement.attr('required', true);
                    }

                }
            };
        }
    ])


    .directive('sSelect', ['objHelper',
        function(objHelper) {

            var InnerTemplate = '<label for="name" ng-bind="label"></label>' +
                '<select class="form-control" ng-disabled="isDisabled" ng-model="inputValue" ng-options="option[option_value] as option[option_label] for option in options"></select>';

            return {
                restrict: 'E',
                replace: true,
                template: '<div class="form-group">' + InnerTemplate + '</div>',
                scope: {
                    name: '@',
                    label: '@',
                    option_label: '@optionLabel',
                    option_value: '@optionValue',
                    options: '='
                },
                require: '^sForm',

                link: function(scope, element, attr, parentCtrl) {

                    scope.inputValue = null;
                    scope.isDisabled = true;

                    scope.isEditable = false;

                    //check if editable form
                    scope.$watch(function() {
                        return parentCtrl.isEditable();
                    }, function(isEditable) {
                        scope.isEditable = isEditable;
                    });

                    var InputElement = element.find('select');

                    // //check if editable form
                    scope.$watch('isEditable', function(currentState) {
                        if (currentState === true) {
                            // InputElement.attr('disabled', false);
                            scope.isDisabled = false;

                            if (attr.disableOn !== undefined && attr.disableOn === 'update') {
                                if (parentCtrl.isNewDraft() !== true) {
                                    scope.isDisabled = true;
                                } else {
                                    scope.isDisabled = false;
                                }
                            }

                            if (attr.disableOn !== undefined && attr.disableOn === 'create') {

                                if (parentCtrl.isNewDraft() === true) {
                                    scope.isDisabled = true;
                                } else {
                                    scope.isDisabled = false;
                                }

                            }

                        } else {
                            // InputElement.attr('disabled', true);
                            scope.isDisabled = true;
                        }
                    });

                    if (attr.notEditable !== undefined) {
                        InputElement.attr('disabled', true);
                    }

                    scope.$on('sForm_data_changed', function(evt, formData) {
                        var setValue = objHelper.getObjectAttr(formData, attr.name);
                        scope.inputValue = setValue;
                    });

                    scope.$watch('inputValue', function(value) {
                        parentCtrl.setValue(scope.name, value);
                    });

                    scope.$on('sForm_data_restored', function(evt, formData) {
                        var setValue = objHelper.getObjectAttr(formData, attr.name);
                        scope.inputValue = setValue;
                    });

                    //apply attributes to input element
                    if (scope.min !== undefined) {
                        InputElement.attr('min', scope.min);
                    }

                    if (scope.max !== undefined) {
                        InputElement.attr('max', scope.max);
                    }

                    if (scope.required !== undefined) {
                        InputElement.attr('required', true);
                    }

                }
            };
        }
    ])


    .directive('sTextarea', ['objHelper',
        function(objHelper) {

            var InnerTemplate = '<label for="{{ name }}" ng-bind="label"></label>' +
                '<textarea class="form-control" ng-disabled="isDisabled" ng-model="inputValue" rows="{{ rows }}"></textarea>';


            return {

                restrict: 'E',
                replace: true,
                template: '<div class="form-group">' + InnerTemplate + '</div>',
                scope: {
                    disableOn: '@',
                    name: '@',
                    label: '@',
                    rows: '@',
                    cols: '@'
                },
                require: '^sForm',

                link: function(scope, element, attr, parentCtrl) {


                    scope.isDisabled = true;
                    scope.isEditable = false;

                    //check if editable form
                    scope.$watch(function() {
                        return parentCtrl.isEditable();
                    }, function(isEditable) {
                        scope.isEditable = isEditable;
                    });


                    var InputElement = element.find('input');

                    // //check if editable form
                    scope.$watch('isEditable', function(currentState) {
                        if (currentState === true) {
                            // InputElement.attr('disabled', false);
                            scope.isDisabled = false;

                            if (attr.disableOn !== undefined && attr.disableOn === 'update') {
                                if (parentCtrl.isNewDraft() !== true) {
                                    scope.isDisabled = true;
                                } else {
                                    scope.isDisabled = false;
                                }
                            }

                            if (attr.disableOn !== undefined && attr.disableOn === 'create') {

                                if (parentCtrl.isNewDraft() === true) {
                                    scope.isDisabled = true;
                                } else {
                                    scope.isDisabled = false;
                                }

                            }

                        } else {
                            // InputElement.attr('disabled', true);
                            scope.isDisabled = true;
                        }
                    });


                    scope.inputValue = null;

                    scope.$on('sForm_data_changed', function(evt, formData) {
                        var setValue = objHelper.getObjectAttr(formData, attr.name);
                        scope.inputValue = setValue;
                    });

                    scope.$watch('inputValue', function(value) {
                        parentCtrl.setValue(scope.name, value);
                    });

                    scope.$on('sForm_data_restored', function(evt, formData) {
                        var setValue = objHelper.getObjectAttr(formData, attr.name);
                        scope.inputValue = setValue;
                    });



                    if (scope.required !== undefined) {
                        InputElement.attr('required', true);
                    }


                }

            };
        }
    ])



    .directive('sControls', [

        function() {

            var editButton = '<button class="btn btn-default" ng-click="editForm()" hide-on-edit > Edit </button>';
            var saveButton = '<button class="btn btn-default" ng-click="saveForm()" show-on-edit > Save </button>';
            var cancelButton = '<button class="btn btn-default" ng-click="cancelForm()" show-on-edit > Cancel </button>';
            var deleteButton = '<button class="btn btn-default pull-right" ng-click="deleteForm()" hide-on-edit > Delete </button>';

            return {
                restrict: 'E',
                replace: true,
                template: '<div class="scontrols">' + '<div class="btn-group pull-left">' + editButton + saveButton + cancelButton + '</div>' + deleteButton + '</div>',

                require: '^sForm',
                link: function(scope, element, attr, parentCtrl) {

                    scope.editForm = function() {
                        parentCtrl.editForm();
                    };

                    scope.saveForm = function() {
                        parentCtrl.saveForm();
                    };

                    scope.cancelForm = function() {
                        parentCtrl.cancelForm();
                    };

                    scope.deleteForm = function() {
                        parentCtrl.deleteForm();
                    };
                }
            };
        }
    ])



    .directive('showWhenTrue', ['$log',
        function() {

            return {
                restrict: 'A',
                require: '^sForm',
                link: function(scope, element, attr, parentCtrl) {
                    var ScopeElement = attr.showWhenTrue;

                    scope.$watch(function() {
                        return parentCtrl.getValue(ScopeElement);
                    }, function(currentValue) {
                        if (currentValue === true) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    });

                }
            };
        }
    ])

    .directive('showWhenFalse', [

        function() {
            return {
                restrict: 'A',
                require: '^sForm',
                link: function(scope, element, attr, parentCtrl) {
                    var ScopeElement = attr.showWhenFalse;

                    scope.$watch(function() {
                        return parentCtrl.getValue(ScopeElement);
                    }, function(currentValue) {
                        if (currentValue !== true) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    });
                }
            };

        }
    ])

    .directive('disableOnCreate', ['$log',
        function($log) {
            return {
                restrict: 'A',
                require: '^sForm',
                link: function(scope, element, attr, parentCtrl) {

                    var InputElement = element.find('input');

                    // //check if editable form
                    scope.$watch(function() {
                        return parentCtrl.isNewDraft();
                    }, function(formStatus) {
                        if (parentCtrl.isEditable()) {
                            if (formStatus === true) {
                                InputElement.attr('disabled', true);
                            } else {
                                InputElement.attr('disabled', false);
                            }
                        }
                    });

                }
            };
        }
    ])

    .directive('disableOnUpdate', ['$log',
        function($log) {
            return {
                restrict: 'A',
                require: '^sForm',
                link: function(scope, element, attr, parentCtrl) {

                    var InputElement = element.find('input');

                    // //check if editable form
                    scope.$watch(function() {
                        return parentCtrl.isNewDraft();
                    }, function(formStatus) {

                        if (parentCtrl.isEditable()) {
                            if (formStatus === true) {
                                InputElement.attr('disabled', false);
                            } else {
                                InputElement.attr('disabled', true);
                            }
                        }

                    });

                }
            };
        }
    ])



    .directive('showOnCreate', [

        function() {
            return {
                restrict: 'A',
                require: '^sForm',
                link: function(scope, element, attr, parentCtrl) {

                    // //check if editable form
                    scope.$watch(function() {
                        return parentCtrl.isNewDraft();
                    }, function(formStatus) {

                        if (formStatus === true) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    });

                }
            };
        }
    ])

    .directive('showOnUpdate', [

        function() {
            return {
                restrict: 'A',
                require: '^sForm',
                link: function(scope, element, attr, parentCtrl) {

                    // //check if editable form
                    scope.$watchCollection(function() {
                        var state = {
                            isNewDraft: parentCtrl.isNewDraft(),
                            isEditable: parentCtrl.isEditable()
                        };

                        return state;

                    }, function(formStatus) {
                        if (formStatus.isEditable === true) {
                            if (formStatus.isNewDraft !== true) {
                                element.show();
                            } else {
                                element.hide();
                            }
                        } else {
                            element.hide();
                        }

                    });

                }
            };
        }
    ])


    .directive('showOnEdit', [

        function() {

            return {
                restrict: 'A',
                require: '^sForm',
                link: function(scope, element, attr, parentCtrl) {
                    scope.$watch(function() {
                        return parentCtrl.isEditable();
                    }, function(isEditable) {
                        if (isEditable === true) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    });
                }
            };
        }
    ])


    .directive('hideOnEdit', [

        function() {

            return {
                restrict: 'A',
                require: '^sForm',
                link: function(scope, element, attr, parentCtrl) {
                    scope.$watch(function() {
                        return parentCtrl.isEditable();
                    }, function(isEditable) {
                        if (isEditable !== true) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    });
                }
            };
        }
    ]);

})();
