/**
 * Author: Milica Kadic
 * Date: 10/21/14
 * Time: 2:51 PM
 */
'use strict';

angular.module('registryApp.dyole')
    .controller('PipelineCtrl', ['$scope', '$element', '$http', 'pipeline', 'App', function ($scope, $element, $http, pipeline, App) {

        $http.get('data/clean_pipeline.json')
            .success(function(data) {

                pipeline.init(data, $element);

            });

    }]);
