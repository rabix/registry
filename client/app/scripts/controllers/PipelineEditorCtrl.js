/**
 * Created by filip on 9.10.14..
 */
'use strict';

angular.module('registryApp')
    .controller('PipelineEditorCtrl', ['$scope', '$timeout', '$location', '$filter', 'Header', 'Loading', '$http', function ($scope, $timeout, $location, $filter, Header, Loading, $http) {

        Header.setActive('pipeline-editor');

        $.ajax({
            url: '/pipeline-editor/data/pipeline.json',
            type: "GET",
            dataType: 'JSON',

            complete: function(data, status, headers, config) {
                Pipeline.init(data.responseJSON, document.getElementsByClassName('pipeline-editor'), {});
            }
        });


    }]);
