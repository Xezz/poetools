'use strict';

angular.module('myApp.expCalc', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/expCalc', {
            templateUrl: 'expCalc/expCalc.html',
            controller: 'ExpCalcCtrl'
        });
    }])

    .controller('ExpCalcCtrl', ['$scope', function ($scope) {
        $scope.range = 20;
        $scope.playerLevel = 1;
        $scope.monsterLevelBoundary = 3;
        $scope.levelTableData = [];
        $scope.fullExpMinLevel = function () {
            return Math.max(1, $scope.playerLevel - $scope.monsterLevelBoundary);
        };
        $scope.fullExpMaxLevel = function () {
            return $scope.playerLevel + $scope.monsterLevelBoundary;
        };
        var calculateExpPenalty = function (playerLevel, zoneLevel) {
            var maxMonsterLevel = playerLevel + Math.abs(playerLevel - zoneLevel);
            var result = Math.pow(maxMonsterLevel / (maxMonsterLevel + Math.pow(calcPlayerLevelToEffectiveLevel(playerLevel, zoneLevel), 2.5)), 1.5) * 100;

            return result - result % 1;
        };
        $scope.getEffectiveLevel = function () {
            if ($scope.playerLevel < 1) {
                $scope.playerLevel = 1;
            } else if ($scope.playerLevel > 100) {
                $scope.playerLevel = 100;
            }
            $scope.monsterLevelBoundary = calcEffectiveLevel($scope.playerLevel);
            $scope.getLevelRanges();
        };

        var calcEffectiveLevel = function (playerLevel) {
            return 3 + Math.floor(playerLevel / 16);
        };
        var calcPlayerLevelToEffectiveLevel = function (playerLevel, zoneLevel) {
            var boundary = calcEffectiveLevel(playerLevel);
            var positiveDifference = Math.abs(playerLevel - zoneLevel);

            return Math.max(0, positiveDifference - boundary);

        };

        $scope.getLevelRanges = function () {
            var result = [];
            var minDif = $scope.playerLevel - $scope.range;
            var maxDif = $scope.playerLevel + $scope.range;
            var min = 1;
            var max = 100;
            if (minDif < min) {
                var onTop = minDif - min;
                maxDif -= onTop;
                minDif = min;
            } else if (maxDif > max) {
                minDif -= maxDif - max;
                maxDif = max;
            }
            for (var zoneLevel = minDif; zoneLevel <= maxDif; zoneLevel++) {
                result.push({
                    level: zoneLevel,
                    expPercentage: calculateExpPenalty($scope.playerLevel, zoneLevel)
                });
            }
            $scope.levelTableData = result;
        };
        var calcPlayerShare = function (player) {
            return Math.pow(player.level + 10, 2.71);

        };
        var calcPartyShare = function (players) {
            var result = {
                totalShare: 0,
                partyMembers: []
            };
            if (players === undefined || players.length === undefined || players.length < 1) {
                return result;
            }
            for (var index = 0; index < players.length; index++) {
                var thatPlayerShare = calcPlayerShare(players[index]);
                result.totalShare += thatPlayerShare;
                result.partyMembers.push({
                    player: players[index],
                    expShare: thatPlayerShare
                });
            }
            return result;
        };
        $scope.getLevelRanges();
    }]);