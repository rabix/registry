/**
 * Author: Milica Kadic
 * Date: 10/21/14
 * Time: 2:51 PM
 */
'use strict';

angular.module('registryApp.dyole')
    .controller('PipelineCtrl', ['$scope', '$element', '$http', 'pipeline', 'App', function ($scope, $element, $http, pipeline, App) {

        var Pipeline;
        var selector = '.pipeline';


        $http.get('data/clean_pipeline.json')
            .success(function(data) {

                Pipeline = pipeline.getInstance({
                    model: data,
                    $parent: angular.element($element[0].querySelector(selector))
                });

            });

        /**
         * Drop node on the canvas
         *
         * @param {MouseEvent} e
         * @param {String} id
         */
        $scope.dropNode = function(e, id) {

            App.getApp(id).then(function(result) {

                Pipeline.addNode(result.data, e.clientX, e.clientY);

            });

        };

    }]);
