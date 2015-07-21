/**
 * Created by branko7171 on 20.7.15..
 */
'use strict';

angular.module('registryApp.common')
.directive('isUnequal', function ($timeout) {
    return {
        require: '?ngModel',
        scope :{
          other: '=',
            own: '='
        },
        link: function(scope, element, attrs,ngModel, ctrl) {
            if(!ngModel) { return; } // do nothing if no ng-model

            // watch own value and re-validate on change
            scope.$watch('own', function() {
                validate();
            });

            // observe the other value and re-validate on change
            scope.$watch('other', function (val) {
                validate();
            });

            var validate = function() {
                $timeout(function(){
                    // values
                    var val1 = scope.own;
                    var val2 = scope.other;
                    var value = (val1 !== val2);
                    // set validity
                    ngModel.$setValidity('isUnequal', value);
                },0);


            };
        }
    };
});

