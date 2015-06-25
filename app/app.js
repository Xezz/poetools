'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.expCalc',
  'myApp.view2',
  'myApp.dpscalc',
  'myApp.version',
  'ui.bootstrap'
]).
config(['$routeProvider', function($routeProvider) {
      $routeProvider.otherwise({redirectTo: '/expCalc'});
}]);
