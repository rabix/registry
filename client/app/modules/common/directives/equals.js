/**
 * Created by branko7171 on 20.7.15..
 */
'use strict';

angular.module('registryApp.common')
.directive('equals', function () {
    return {
        require: '?ngModel',
        scope :{
          equals: '=',
            own: '='
        },
        link: function(scope, element, attrs,ngModel, ctrl) {
            if(!ngModel) { return; } // do nothing if no ng-model

            // watch own value and re-validate on change
            scope.$watch('own', function() {
                validate();
            });

            // observe the other value and re-validate on change
            scope.$watch('equals', function (val) {
                validate();
            });

            var validate = function() {
                // values
                var val1 = scope.own;
                var val2 = scope.equals;

                // set validity
                ngModel.$setValidity('equals', val1 !== val2);
            };
        }
    };
});

