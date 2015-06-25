'use strict';

angular.module('myApp.expCalc', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/expCalc', {
            templateUrl: 'expCalc/expCalc.html',
            controller: 'ExpCalcCtrl'
        });
    }])

    .controller('ExpCalcCtrl', ['$scope', function ($scope) {
        $scope.playerLevel = 1;
        $scope.monsterLevelBoundary = 3;
        $scope.levelTableData = [];
        $scope.fullExpMinLevel = function () {
            return Math.max(1, $scope.playerLevel - $scope.monsterLevelBoundary);
        };
        $scope.fullExpMaxLevel = function () {
            return $scope.playerLevel + $scope.monsterLevelBoundary;
        };
        var calculateExpPenality = function (playerLevel, zoneLevel) {
            var maxMonsterLevel = playerLevel + Math.abs(playerLevel - zoneLevel);
            var result = Math.pow(maxMonsterLevel / (maxMonsterLevel + Math.pow(calcPlayerLevelToEffectiveLevel(playerLevel, zoneLevel), 2.5)), 1.5) * 100;

            return result - result % 1;
        };
        $scope.getEffectiveLevel = function () {
            $scope.monsterLevelBoundary = calcEffectiveLevel($scope.playerLevel);
            $scope.getLevelRanges();
        };

        var calcEffectiveLevel = function (playerLevel) {
            return 3 + Math.floor(playerLevel / 16);
        };
        var calcPlayerLevelToEffectiveLevel = function (playerLevel, zoneLevel) {
            // 1, 1
            var boundary = calcEffectiveLevel(playerLevel);
            var positveDifference = Math.abs(playerLevel - zoneLevel);

            return Math.max(0, positveDifference - boundary);

        };

        $scope.getLevelRanges = function () {
            var result = [];
            for (var zoneLevel = 1; zoneLevel <= 100; zoneLevel++) {
                result.push({
                    level: zoneLevel,
                    expPercentage: calculateExpPenality($scope.playerLevel, zoneLevel)
                });
            }
            $scope.levelTableData = result;
        };
        $scope.getLevelRanges();
    }]);