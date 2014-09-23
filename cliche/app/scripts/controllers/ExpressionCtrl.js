'use strict';

angular.module('clicheApp')
    .controller('ExpressionCtrl', ['$scope', '$modalInstance', 'options', 'Data', function ($scope, $modalInstance, options, Data) {

        $scope.options = options;

        $scope.view = {};

        var expression = Data.getExpression($scope.options.type, $scope.options.namespace);

        $scope.view.code = expression.code;

        $scope.ok = function (value) {

            Data.setExpressionValue($scope.options.type, $scope.options.namespace, value);

            $modalInstance.close(value);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }]);
