/**
 * Created by filip on 9.10.14..
 */
'use strict';

angular.module('registryApp')
    .controller('PipelineEditorCtrl', ['$scope', '$timeout', '$location', '$filter', 'Header', 'Loading', function ($scope, $timeout, $location, $filter, Header, Loading) {

        Header.setActive('pipeline-editor');

        console.log('welcome to pipeline editor');
        console.log(typeof Pipeline);
    }]);
