(function() {
    'use strict';
    /* global angular:false, CryptoJS:false */
    angular.module('smartui.smartPanel', ['app.smartDraftStorage'])

    .factory('$smartPanel', ['$rootScope', '$log', 'draftStorage', '$dialogs', '$http', 'appConfig', '$q',
        function($rootScope, $log, draftStorage, $dialogs, $http, appConfig, $q) {

            $log.debug('>> $smartPanel instantiated');

            var ParentScope = $rootScope.$new(true);

            function SmartPanel(DataResourceApi, panelID) {

                $log.debug('smartPanel ' + panelID + ' created');

                this.serverStatus = {
                    active: false,
                    checkedOn: null
                };

                this.panelID = panelID;
                this.scoped = ParentScope.$new(true);

                this.draftStorageLocal = draftStorage.create(this.panelID);
                this.offlineSavedLocal = draftStorage.create(this.panelID + '_offline');

                this.scoped.api = DataResourceApi;
                this.scoped.dataCollection = [];

                this.scoped.lastSelected = {};
                this.scoped.selectedItems = [];
                this.scoped.selectionCapacity = 1; // if 0, any number of items can be pushed, else only limited to set number
                this.scoped.childComponents = {};

                // actions that the panel allows to perform on dataCollection items
                this.scoped.read = true;
                this.scoped.create = true;
                this.scoped.modify = true;
                this.scoped.remove = true;

                this.scoped.crudActions = {
                    'read': this.scoped.read,
                    'create': this.scoped.create,
                    'modify': this.scoped.modify,
                    'remove': this.scoped.remove
                };

                this.scoped.newDrafts = []; //new items created but not yet sent to server
                this.scoped.offlineSavedDrafts = []; // modified items but not yet saved to server

                this.eventHandlers = {};
            }

            //API Methods
            SmartPanel.prototype.setApi = function(api) {
                this.scoped.api = api;
            };


            SmartPanel.prototype.crudActions = function() {
                return this.scoped.crudActions;
            };

            // Check if the application is able to connect to the server
            // First it checks if the client app has internet connection
            // if connection available then it will check if server is available before making any request
            // and sets the server status with last checked time and status, hence future checks will run within server check time interval if exceeded
            SmartPanel.prototype.isOnline = function() {
                if (navigator.onLine === true) {
                    var DateObj = new Date(),
                        CurrentTime = DateObj.getTime(),
                        statusTimeDiff = false;

                    if (this.serverStatus.checkedOn !== null) {
                        var lastChecked = this.serverStatus.checkedOn;
                        var DiffTime = Math.floor((CurrentTime - lastChecked) / 1000); // in seconds

                        if (DiffTime < this.serverCheckInterval) {
                            statusTimeDiff = true;
                        }
                    }

                    //check server status
                    if (this.serverStatus.active === false || statusTimeDiff === false) {
                        if (appConfig.get('demo') === true) {
                            return true;
                        }

                        var smartpanel = this,
                            promise = $http.head(appConfig.get('server'))
                                .success(function() {
                                    smartpanel.serverStatus.active = true;
                                    smartpanel.serverStatus.checkedOn = Date.now();
                                })

                            .error(function() {
                                smartpanel.serverStatus.active = false;
                                smartpanel.serverStatus.checkedOn = Date.now();
                            });

                        return promise;
                    }

                    return true;
                }

                return false;
            };

            /**
             * Fetches the data from api resource
             */
            SmartPanel.prototype.fetchData = function(option) {

                if (this.scoped.read === true) {

                    this.scoped.dataCollection = this.scoped.api.query(option);

                    return this.scoped.dataCollection;
                }

            };


            /**
             * Fetch any existing drafts from draftStorageLocal
             * @return {[type]} [description]
             */
            SmartPanel.prototype.fetchDrafts = function() {

                if (this.scoped.read === true) {

                    //fetch only when memory is empty
                    if (this.scoped.newDrafts.length === 0) {
                        var AllDrafts = this.draftStorageLocal.all();
                        if (angular.isObject(AllDrafts) || angular.isArray(AllDrafts)) {
                            for (var o in AllDrafts) {
                                this.scoped.newDrafts.push(AllDrafts[o]);
                            }
                        }
                    }

                    return this.scoped.newDrafts;
                }
            };


            /**
             * Method to access the stored collection
             * @return {array}
             */
            SmartPanel.prototype.getDataCollection = function() {
                return this.scoped.dataCollection;
            };


            /**
             * Method to access the drafts
             * @return {array}
             */
            SmartPanel.prototype.getDrafts = function() {
                return this.scoped.newDrafts;
            };



            SmartPanel.prototype.getSelectedItems = function() {
                return this.scoped.selectedItems;
            };


            SmartPanel.prototype.getLastSelectedItem = function() {
                return this.scoped.lastSelected;
            };


            /**
             * Add a selected item to selection
             */
            SmartPanel.prototype.addToSelection = function(item, isNewDraft) {

                if (this.scoped.selectionCapacity !== 0) {

                    var numItems = this.scoped.selectedItems.length,
                        limit = this.scoped.selectionCapacity;

                    if ((parseInt(numItems) + 1) > limit) {
                        var indx = limit - 1;
                        this.scoped.selectedItems.splice(indx);
                    }
                }

                this.scoped.selectedItems.unshift(item);
                this.scoped.lastSelected = item;

                if (isNewDraft === undefined || isNewDraft === false) {
                    this.runEventHandler('lastSelected', item);
                }

            };


            SmartPanel.prototype.removeFromSelection = function(item) {
                var index = this.scoped.selectedItems.indexOf(item);
                this.scoped.selectedItems.splice(index, 1);
                if (this.scoped.lastSelected == item) {
                    this.scoped.lastSelected = {};
                    this.runEventHandler('lastSelected', undefined);
                }
            };


            SmartPanel.prototype.setSelectionLimit = function(limit) {
                this.scoped.selectionCapacity = limit;
                if (limit > 0 && (limit !== undefined || limit !== null)) {
                    var numItems = this.scoped.selectedItems.length,
                        diff;

                    //if the number of items already exceeds the limit, 
                    //we remove them from top until limit is matched
                    if (numItems > limit) {
                        diff = parseInt(numItems) - parseInt(limit);
                        this.scoped.selectedItems.splice(-numItems, diff);
                    }
                }
            };


            SmartPanel.prototype.getHash = function(item) {
                var currentTime,
                    salt,
                    hashID;

                if (item !== undefined) {
                    hashID = CryptoJS.MD5(angular.toJson(item)).toString();
                } else {
                    currentTime = Math.round(+new Date() / 1000);
                    salt = Math.floor((Math.random() * 100) + 1) + Math.floor((Math.random() * 100) + 1);
                    hashID = CryptoJS.MD5(currentTime + '&' + currentTime + '#' + salt);
                }

                return hashID.toString();
            };


            /**
             * Add an item to drafts collection
             * @param  {object} item
             * @return {void}
             */
            SmartPanel.prototype.addToDraft = function(item) {

                var draftLocalStorage = this.draftStorageLocal,
                    hashFunc,
                    version_hash;

                hashFunc = this.getHash;
                item.draftId = this.getHash();
                version_hash = this.getHash(item);

                this.scoped.newDrafts.unshift(item);

                this.scoped.$watch(function() {
                    return angular.toJson(item);
                }, function() {
                    // if initial version and current version is diff, we apply update to local storage
                    if (version_hash !== hashFunc(item)) {
                        var key = item.draftId;
                        if (key !== undefined) {
                            draftLocalStorage.put(key, item);
                        }
                    }

                });

                return item;

            };


            /**
             * Returns a new draft resource for creating new item
             * @return {resource object}
             */
            SmartPanel.prototype.newDraft = function() {

                var draft = new this.scoped.api();

                //add new draft resource to draftStorage
                draft = this.addToDraft(draft);

                //add the draft to current selection
                this.addToSelection(draft, true);

                this.runEventHandler('newDraft', draft);
                return draft;
            };



            SmartPanel.prototype.draftSave = function(draftItem) {

                var draftID = draftItem.draftId,
                    savedItem = this.save(draftItem);

                if (savedItem !== false) {
                    this.draftSaved(draftID, savedItem);
                }

            };



            SmartPanel.prototype.checkIsOnline = function(doWhenOnline, doWhenOffline) {

                doWhenOnline(); // for testing on local server
                // if(navigator.onLine === true) {
                //     doWhenOnline();
                // } else {
                //     doWhenOffline();
                // }
            };


            SmartPanel.prototype.save = function() {

                var item,
                    // getLastSelectedItem = this.getLastSelectedItem,
                    self,
                    Promise,
                    dRequest,
                    dSaveRequest,
                    isDraft = true,
                    draftId,
                    isOnline;


                item = this.getLastSelectedItem();

                // isOnline = this.isOnline();

                if (item.id !== undefined) {
                    isDraft = false;
                } else {
                    draftId = item.draftId;
                    // if the item is taken from local storage, we need to make it a resource
                    if (item.$save === undefined) {
                        var Api = this.scoped.api;
                        item = new Api(item);
                    }
                }

                // create a diferred request
                dRequest = $q.defer();
                dSaveRequest = $q.defer();

                //check if online or not, then resolve the item initially
                this.checkIsOnline(function() {
                    dRequest.resolve(item);
                }, function() {
                    dRequest.reject(item);
                });


                self = this;
                Promise = dRequest.promise;
                Promise.then(function(savingItem) {
                    //connection online
                    //trying to save to server
                    var savedItemPromise = savingItem.$save();
                    savedItemPromise.then(function(savedItem) {

                        if (isDraft === true) {

                            self.draftSaved(draftId, savedItem); // puts the new draft into collection and removes drafft item from frafts
                        } else {

                            if (self.hasOfflineVersion(savedItem.id)) {
                                self.removeOfflineVersion(savedItem.id);
                            }
                        }

                        dSaveRequest.resolve(savedItem);

                        return savedItem;

                    }, function(unsavedItem) {
                        dSaveRequest.reject(unsavedItem);
                        return unsavedItem;
                    });

                    return savedItemPromise;

                }, function(unsavedItem) {
                    // conection offline
                    $dialogs.notify('Saved Offline', 'Your are offline or internet connection is not available. The updates are saved offline. Try saving later when you are online.');
                    dSaveRequest.reject('offlineSaved');
                    return unsavedItem;
                });


                return dSaveRequest.promise;
            };


            SmartPanel.prototype.whenRemovedFromOffline = function(itemId, callback) {
                this.onChange('offline_remove_' + itemId, callback);
            };

            SmartPanel.prototype.whenOfflineSaved = function(itemId, callback) {
                this.onChange('offline_saved_' + itemId, callback);
            };


            SmartPanel.prototype.hasOfflineVersion = function(itemId) {
                if (itemId === undefined) {
                    return false;
                }

                return this.offlineSavedLocal.hasKey(itemId);
            };


            SmartPanel.prototype.getOfflineVersion = function(itemId) {
                if (itemId === undefined) {
                    return;
                }
                return this.offlineSavedLocal.get(itemId);
            };


            SmartPanel.prototype.removeOfflineVersion = function(itemId) {
                if (itemId === undefined) {
                    return;
                }

                this.offlineSavedLocal.remove(itemId);
                this.runEventHandler('offline_remove_' + itemId);
            };


            SmartPanel.prototype.confirmToRestoreOfflineVersion = function(currentItem) {
                var itemId = currentItem.id;

                var response = $dialogs.confirm('Restore', 'There is a locally stored unsaved version, would you like to restore it?'),
                    smartpanel = this,
                    Result = response.result.then(function() {
                        return smartpanel.getOfflineVersion(itemId);
                    }, function() {
                        smartpanel.removeOfflineVersion(itemId);
                        return currentItem;
                    });

                return Result;
            };



            SmartPanel.prototype.autoSaveOffline = function(item) {
                //check if the item is not a newDraft, and is a resource with id property, 
                //when conditions are true, we track it, else we ignore
                if (item.draftId === undefined && item.id !== undefined && item._offlineId === undefined) {


                    item._offlineId = item.id; //this.getHash(item.id);

                    var hashFunc = this.getHash,
                        self = this,
                        offlineSavedLocal = this.offlineSavedLocal,
                        version_hash = hashFunc(item);

                    this.scoped.offlineSavedDrafts.unshift(item);


                    this.scoped.$watch(function() {
                        return angular.toJson(item);
                    }, function() {
                        // if initial version and current version is diff, we apply update to local storage
                        if (version_hash !== hashFunc(item)) {
                            var key = item._offlineId;
                            if (key !== undefined) {
                                if (self.hasOfflineVersion(item.id) !== true) {
                                    self.runEventHandler('offline_saved_' + item.id);
                                }

                                offlineSavedLocal.put(key, item);
                            }

                        }

                    });
                }
            };


            /**
             * Updates the draft collection by removing the draft item saved and adding the saved draftItem
             * to the dataCollection
             * @param  {string} draftID   hashkey
             * @param  {object} draftItem resource object returned from server
             * @return {void}
             */
            SmartPanel.prototype.draftSaved = function(draftID, savedItem) {

                this.draftRemove(draftID, angular.copy(savedItem));

                this.scoped.dataCollection.push(savedItem);
            };



            /**
             * Removes a draft from the draft collection
             * @param  {string} draftID hashkey
             * @return {void}
             */
            SmartPanel.prototype.draftRemove = function(draftID, draftItem) {

                var index = this.scoped.newDrafts.indexOf(draftItem);
                this.scoped.newDrafts.splice(index, 1);
                this.draftStorageLocal.remove(draftID);

            };



            SmartPanel.prototype.remove = function(item) {

                var deferred = $q.defer();

                //check if the item is a draft
                if (item.draftId !== undefined) {
                    this.draftRemove(item.draftId);
                    deferred.resolve(true);
                } else {
                    //remove the item from server
                    var self = this;
                    if (this.scoped.remove === true) {

                        this.checkIsOnline(function() {
                                item.$remove().then(function() {

                                    self.removedFromDataCollection(item);
                                    deferred.resolve(true);
                                });
                            },
                            function() {
                                $dialogs.notify('Offline', 'Most likely you do not have internet connection or connection to the server is not available at this time. Please try again later.');
                                deferred.reject(false);
                                return null;
                            });

                    }

                    deferred.reject(false);
                }

                return deferred.promise;

            };


            SmartPanel.prototype.removedFromDataCollection = function(item) {
                var index = this.scoped.dataCollection.indexOf(item);
                this.scoped.lastSelected = {};
                this.scoped.dataCollection.splice(index, 1);
            };


            /**
             * onChange binds a event listener to a given scope,
             * @param  {string} scope
             * @param  {function} handler
             * @return void
             */
            SmartPanel.prototype.onChange = function(scope, handler) {
                if (this.eventHandlers[scope] === undefined || angular.isArray(this.eventHandlers[scope]) === false) {

                    this.eventHandlers[scope] = [];

                }
                this.eventHandlers[scope].push(handler);
            };



            SmartPanel.prototype.runEventHandler = function(eventName, param) {
                if (this.eventHandlers[eventName] !== undefined && angular.isArray(this.eventHandlers[eventName])) {
                    var handlers = this.eventHandlers[eventName],
                        handler;

                    for (var indx in handlers) {
                        handler = handlers[indx];
                        handler(param);
                    }
                }
            };


            /**
             * Holds all the Panels in memory
             * @type {Object}
             */
            var CachedPanels = {};


            return {
                $new: function(panelID, api) {
                    if (CachedPanels[panelID] !== undefined) {
                        CachedPanels[panelID].setApi(api);
                        return CachedPanels[panelID];
                    }

                    CachedPanels[panelID] = new SmartPanel(api, panelID);
                    return CachedPanels[panelID];
                },

                $get: function(panelID) {
                    if (CachedPanels[panelID] !== undefined) {
                        return CachedPanels[panelID];
                    }

                    return undefined;
                }
            };

        }
    ]);

})();
