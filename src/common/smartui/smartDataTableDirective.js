(function() {
    'use strict';
    /* global angular:false, $: false */
    angular.module('smartDataTableDirective', ['smartui.smartPanel'])

    .filter('colFilter', ['$log', 'objHelper',
        function($log, objHelper) {

            return function(dataCollection, filterObject) {

                var filterConfig = {},
                    ColumnFilters = [];

                for (var indx in filterObject) {
                    var item = filterObject[indx];

                    if (item.selected.length > 0) {
                        filterConfig[item.column] = item.selected;
                        ColumnFilters.push(item.column);
                    }
                }

                if (ColumnFilters.length === 0) {
                    // when no filter applied, return everything
                    return dataCollection;
                }

                var collection = $.grep(dataCollection, function(data) {
                    var status = true;
                    for (var key in filterConfig) {

                        if (status === true) {
                            var itemValue = objHelper.getObjectAttr(data, key);
                            if (filterConfig[key].indexOf(itemValue) === -1) {
                                status = false;
                            }
                        }

                    }

                    return status;
                });

                return collection;
            };
        }
    ])

    .directive('sTable', ['$log', 'objHelper',
        function($log, objHelper) {

            return {

                restrict: 'E',
                replace: true,
                transclude: true,
                templateUrl: 'smartui/templates/table.tpl.html',
                require: '^sPanel',
                controller: ['$scope',
                    function($scope) {
                        $scope.items = [];
                        $scope.draftItems = [];
                        $scope.columns = [];
                        $scope.columnLabels = {};
                        $scope.filterByColumns = false;
                        $scope.filterColumns = [];
                        $scope.columnFilter = {};

                        $scope.columnRowTemplates = {};

                        $scope.filterEnabled = false;

                        $scope.filterLabel = '';

                        $scope.filterText = '';

                        $scope.totalColumns = 0;

                        this.getSmartpanel = function() {
                            return $scope.smartpanel;
                        };

                        this.addTemplate = function(template, columnName) {
                            $scope.columnRowTemplates[columnName] = template;
                        };

                        this.getColumnRowTemplate = function(columnName) {
                            if ($scope.columnRowTemplates[columnName] !== undefined) {
                                return $scope.columnRowTemplates[columnName];
                            }
                            return null;
                        };


                        this.addColumn = function(columnName, htmlContent) {
                            $scope.columns.push({
                                name: columnName,
                                content: htmlContent
                            });
                            $scope.totalColumns = $scope.columns.length;
                            /*global $:false */
                            $scope.columnLabels[columnName] = $(htmlContent).text();
                        };

                        this.getColumnLabel = function(column) {
                            return $scope.columnLabels[column];
                        };

                        this.onScope = function(callback) {
                            callback($scope);
                        };

                        this.rowSelected = function(item) {
                            $scope.$broadcast('smartTable_row_selected', item);
                            $scope.updateTableSelection();
                        };

                        this.unselectedRow = function(item) {
                            $scope.$broadcast('smartTable_row_unselected', item);
                            $scope.updateTableSelection();
                        };

                        this.enableFilter = function(setValue) {

                            $scope.filterEnabled = setValue;
                        };

                        this.setFilterLabel = function(filterLabel) {
                            $scope.filterLabel = filterLabel;
                        };

                        this.setFilterByColumns = function(columnsStack) {
                            var columns = [],
                                currentLabel;

                            if (columnsStack !== undefined) {
                                $scope.filterByColumns = true;
                                columns = columnsStack.split('|');
                            }

                            for (var indx in columns) {
                                currentLabel = $scope.columnLabels[columns[indx]];
                                $scope.filterColumns.push({
                                    column: columns[indx],
                                    options: [],
                                    label: currentLabel,
                                    selected: []
                                });
                            }

                        };

                        // $scope.$watch('filterColumns', function(newItems) {
                        //     console.log('filter columns changed');
                        //     console.log(newItems);
                        // });

                    }
                ],
                link: function(scope, element, attrs, smartPanel) {

                    scope.smartpanel = smartPanel.getService();

                    scope.items = scope.smartpanel.fetchData();
                    scope.draftItems = scope.smartpanel.fetchDrafts();

                    scope.updateTableSelection = function() {
                        scope.selectedItems = scope.smartpanel.getSelectedItems();
                        scope.$broadcast('tableSelectedItems_changed', scope.selectedItems);
                    };


                    function populateFilterColumnOptions(collectedItems) {
                        if (collectedItems !== undefined) {
                            //re-populate filter values by given columns extracting unique values of that column
                            for (var indx in scope.filterColumns) {
                                var columnItem = scope.filterColumns[indx];

                                scope.filterColumns[indx].options = objHelper.getUniqueValuesByKey(columnItem.column, collectedItems);
                                scope.filterColumns[indx].label = scope.columnLabels[columnItem.column];
                            }
                        }
                    }


                    scope.$watchCollection('items', function(collectedItems) {
                        if (scope.filterByColumns === true) {
                            populateFilterColumnOptions(collectedItems);
                        }
                    });


                    scope.$on('smartTable_row_selected', function(evt, item) {
                        scope.smartpanel.addToSelection(item);
                    });

                    scope.$on('smartTable_row_unselected', function(evt, item) {
                        scope.smartpanel.removeFromSelection(item);
                    });

                    scope.$on('smartDataCollection_updated', function(evt, collection) {
                        scope.items = collection;
                    });

                    scope.filterlist = '';

                    scope.$watch('filterText', function(searchTerm) {

                        if (scope.filterEnabled) {
                            scope.filterlist = searchTerm;
                        }
                    });

                    scope.newDraft = function() {
                        scope.smartpanel.newDraft();
                    };

                }
            };

        }
    ])

    .directive('sFilter', [

        function() {

            return {
                restrict: 'E',
                scope: {
                    label: '@'
                },
                require: '^sTable',
                link: function(scope, element, attr, parentCtrl) {

                    parentCtrl.enableFilter(true);
                    if (attr.label !== undefined) {
                        parentCtrl.setFilterLabel(attr.label);
                    }

                    if (attr.columns !== undefined) {
                        parentCtrl.setFilterByColumns(attr.columns);
                    }

                }

            };
        }
    ])

    .directive('sColumnSelect', [

        function() {

            return {
                restrict: 'E',
                replace: true,
                templateUrl: 'smartui/templates/column_selector.tpl.html',
                scope: {
                    column: '='
                },
                require: '^sTable',
                link: function(scope, element, attr, parentCtrl) {


                    if (scope.selectionItems === undefined) {
                        scope.selectionItems = [];
                    }

                    scope.dropdownShow = false;
                    scope.toggleDropdown = function() {
                        scope.dropdownShow = !scope.dropdownShow;
                    };

                    scope.reset = function() {
                        scope.selectionItems = [];
                        scope.column.selected = [];
                        scope.dropdownShow = false;
                    };


                    scope.title = '';

                    scope.selectedItem = function(item) {
                        //if item already in the list, we unselect it, if not we add
                        var indx = scope.selectionItems.indexOf(item);
                        if (indx < 0) {
                            scope.selectionItems.push(item);
                        } else {
                            scope.selectionItems.splice(indx, 1);
                        }

                        scope.column.selected = scope.selectionItems;
                    };

                    scope.isSelectionEmpty = function() {
                        if (scope.selectionItems.length === 0) {
                            return true;
                        }
                        return false;
                    };

                    scope.isSelected = function(item) {
                        if (scope.selectionItems.indexOf(item) < 0) {
                            return false;
                        }
                        return true;
                    };

                    scope.apply = function() {
                        // scope.column.selected = scope.selectionItems;
                        scope.dropdownShow = false;

                        // console.log('applying');
                        // parentCtrl.setFilterColumnValues(scope.column.column, angular.copy(scope.selectionItems));
                    };


                    parentCtrl.onScope(function(parentScope) {
                        parentScope.$watch('columnLabels', function(columnLabels) {
                            if (columnLabels[scope.column.column] !== undefined) {
                                scope.title = angular.copy(scope.column.label);
                            }
                        });
                    });


                }
            };
        }
    ])

    .directive('sColumn', [

        function() {

            return {
                restrict: 'E',
                transclude: true,
                replace: true,
                template: '<span ng-transclude></span>',
                require: '^sTable',
                scope: {
                    templateBind: '='
                },
                link: function(scope, element, attr, parentCtrl) {
                    if (attr.template !== undefined) {
                        parentCtrl.addTemplate(attr.template, attr.name);
                    }

                    if (scope.templateBind !== undefined) {

                        parentCtrl.addTemplate(angular.copy(scope.templateBind), attr.name);
                    }

                    // add all the columns
                    parentCtrl.addColumn(attr.name, element.html());
                }

            };
        }
    ])

    .directive('thTemplate', ['$compile',
        function($compile) {

            return {
                restrict: 'E',
                require: '^sTable',
                scope: {
                    content: '='
                },
                link: function(scope, element, attr, parentCtrl) {

                    var TemplateStr = scope.content,
                        template,
                        replaceElement;
                    if (TemplateStr !== undefined) {
                        template = angular.element(TemplateStr);
                        replaceElement = $compile(template)(scope);
                        element.replaceWith(replaceElement);
                    }
                }
            };
        }
    ])

    .directive('tdTemplate', ['$compile',
        function($compile) {

            return {
                restrict: 'E',
                template: '<span ng-bind="value"></span>',
                replace: true,
                scope: {
                    value: '=',
                    name: '@'
                },
                require: '^sTable',
                link: function(scope, element, attr, parentCtrl) {

                    var TemplateStr = parentCtrl.getColumnRowTemplate(scope.name),
                        template,
                        replaceElement;
                    if (TemplateStr !== null) {

                        //render the template 
                        template = angular.element(TemplateStr);

                        replaceElement = $compile(template)(scope);
                        element.replaceWith(replaceElement);
                    }
                }
            };
        }
    ])

    .directive('sRow', [

        function() {

            return {
                restrict: 'A',
                template: '<td ng-repeat="cell in columns"><td-template name="{{cell.name}}" value="getValueByAttr(row, cell.name)"></td-template></td>',
                scope: {
                    row: '=data',
                    columns: '=columns'
                },
                require: '^sTable',
                controller: ['$scope',
                    function($scope) {

                        $scope.getValueByAttr = function(data, attrName) {


                            var levelKeys = attrName.split('.');

                            if (levelKeys.length > 1) {
                                var sets = data;
                                for (var indx in levelKeys) {
                                    var vkey = levelKeys[indx];
                                    if (sets[vkey] !== undefined) {
                                        sets = sets[vkey];
                                    } else {
                                        sets = undefined;
                                        break;
                                    }
                                }

                                return sets;
                            } else {
                                var key = levelKeys.pop();
                                return data[key];
                            }
                        };

                    }
                ],

                link: function(scope, element, attr, parentCtrl) {

                    var smartpanel = parentCtrl.getSmartpanel();

                    element.click(function() {
                        if (element.hasClass('current')) {
                            parentCtrl.unselectedRow(scope.row);
                            element.removeClass('current');

                        } else {
                            element.addClass('current');
                            parentCtrl.rowSelected(scope.row);

                        }
                    });

                    if (scope.row.draftId !== undefined) {
                        element.addClass('isDraft');
                    } else {
                        element.removeClass('isDraft');
                    }

                    if (scope.row.id !== undefined) {
                        if (smartpanel.hasOfflineVersion(scope.row.id)) {
                            element.addClass('isOfflineVersion');
                            smartpanel.whenRemovedFromOffline(scope.row.id, function() {
                                element.removeClass('isOfflineVersion');
                            });
                        } else {
                            //if whenever the row item gets saved to offline, then we need to add
                            //the class, so we register a callback
                            smartpanel.whenOfflineSaved(scope.row.id, function() {
                                element.addClass('isOfflineVersion');

                                smartpanel.whenRemovedFromOffline(scope.row.id, function() {
                                    element.removeClass('isOfflineVersion');
                                });
                            });
                        }
                    }

                    scope.$on('tableSelectedItems_changed', function(evt, currentSelection) {
                        if (currentSelection.indexOf(scope.row) > -1) {
                            element.addClass('selected');
                        } else {
                            element.removeClass('selected');
                            element.removeClass('current');
                        }
                    });
                }
            };
        }
    ]);

})();
