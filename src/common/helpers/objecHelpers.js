(function() {
    'use strict';
    /* global angular:false */
    angular.module('objectHelperModule', [])

    .service('objHelper', [
        function() {

            return {

                getObjectAttr: function(obj, prop) {
                    var parts = prop.split('.'),
                        last = parts.pop(),
                        L = parts.length,
                        i = 1,
                        current = parts[0];

                    if (L === 0 && current === undefined) {
                        return obj[last];
                    }

                    while ((obj = obj[current]) && i < L) {
                        current = parts[i];
                        i++;
                    }

                    if (obj) {
                        return obj[last];
                    }
                },

                setObjectAttr: function(obj, prop, value) {
                    if (obj === undefined) {
                        return obj;
                    }

                    console.log('setObjectAttr called ' + prop);
                    if (obj === undefined) {
                        console.log('obj is undefined');
                    }

                    var parts = prop.split('.'),
                        last = parts.pop(),
                        L = parts.length,
                        i = 1,
                        current = parts[0];

                    console.log('>>>> PARTS ');
                    console.log(parts);

                    if (L === 0 && current === undefined) {
                        obj[last] = value;

                    } else {
                        while ((obj = obj[current]) && i < L) {
                            current = parts[i];
                            if (obj[current] === undefined) {
                                obj[current] = {};
                            }
                            i++;
                        }

                        if (obj) {
                            obj[last] = value;
                        }
                    }

                    console.log(obj);
                    return obj;
                },

                getUniqueValuesByKey: function(key, heystack) {
                    var extracted = [];
                    var fetchedColumn = {};

                    if (angular.isArray(heystack)) {
                        for (var indx in heystack) {
                            var item = heystack[indx],
                                columnValue = this.getObjectAttr(item, key);

                            if (columnValue !== undefined && fetchedColumn[columnValue] === undefined) {
                                extracted.push(columnValue);
                                fetchedColumn[columnValue] = true;
                            }
                        }
                    }

                    return extracted;
                },

                getObjectKeys: function(obj) {
                    var a = [];
                    console.log('getObjectKeys called');

                    for (var key in obj) {
                        a.push(key);
                    }
                    console.log('retuning keys :: >>');
                    console.log(a);
                    return a;
                }
            };

        }
    ]);

})();
