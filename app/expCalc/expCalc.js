'use strict';

angular.module('myApp.expCalc', ['ngRoute', 'ui.bootstrap'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/expCalc', {
            templateUrl: 'expCalc/expCalc.html',
            controller: 'ExpCalcCtrl'
        });
    }])

    .controller('ExpCalcCtrl', ['$scope', '$http', function ($scope, $http) {
        $scope.range = function () {
            var theRange = 10 + Math.floor(($scope.player.playerLevel - 1) / 15);
            return theRange;
        };
        $scope.player = {
            playerLevel: 1,
            expShare: 0
        };
        $scope.monsterLevelBoundary = 3;
        $scope.levelTableData = [];
        $scope.partyMembers = [];
        $scope.fullExpMinLevel = function () {
            return Math.max(1, $scope.player.playerLevel - $scope.monsterLevelBoundary);
        };
        $scope.fullExpMaxLevel = function () {
            return $scope.player.playerLevel + $scope.monsterLevelBoundary;
        };
        var specialMap = {};
        $http.get('data/leveldata.json').success(function (response) {
            specialMap = response;
        });
        var startMap = 68;
        var endMap = 83;
        var calculateExpPenalty = function (playerLevel, zoneLevel) {
            if (zoneLevel >= specialMap.startLevel) {
                zoneLevel = specialMap[zoneLevel];
            }
            var result = Math.pow((5 + playerLevel) / (5 + playerLevel + Math.pow(calcPlayerLevelToEffectiveLevel(playerLevel, zoneLevel), 2.5)), 1.5) * 100;
            if (playerLevel >= 95) {
                console.log('result before', result, 'playerlevel', playerLevel);
                var multiplier = ( 1 / (1 + 0.1 * (playerLevel - 94)));
                result *= multiplier;
                console.log('result after', result, 'playerlevel', playerLevel, 'mulit', multiplier);
            }
            result = result.toFixed(2);
            if (result < 1) {
                result = 1;
            }
            return result;
        };
        $scope.getEffectiveLevel = function () {
            if ($scope.player.playerLevel < 1) {
                $scope.player.playerLevel = 1;
            } else if ($scope.player.playerLevel > 100) {
                $scope.player.playerLevel = 100;
            }
            $scope.monsterLevelBoundary = calcEffectiveLevel($scope.player.playerLevel);
            $scope.getLevelRanges();
            $scope.calcPartyShare();
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
            var minDif = $scope.player.playerLevel - $scope.range();
            var maxDif = $scope.player.playerLevel + $scope.range();
            var min = 1;
            var max = 100;
            if (minDif < min) {
                maxDif -= minDif - min;
                minDif = min;
            } else if (maxDif > max) {
                minDif -= maxDif - max;
                maxDif = max;
            }
            if (maxDif > specialMap.endLevel) {
                maxDif = specialMap.endLevel;
            }
            for (var zoneLevel = minDif; zoneLevel <= maxDif; zoneLevel++) {
                result.push({
                    level: zoneLevel,
                    expPercentage: calculateExpPenalty($scope.player.playerLevel, zoneLevel),
                    mapTier: (zoneLevel >= startMap && zoneLevel <= endMap) ? "(Tier " + (zoneLevel - startMap + 1) + ")" : ""
                });
            }
            $scope.levelTableData = result;
        };
        var calcPlayerShare = function (player) {
            return Math.pow(player.playerLevel + 10, 2.71);

        };
        $scope.calcPartyShare = function () {
            $scope.totalShare = 0;
            //if ($scope.partyMembers === undefined || $scope.partyMembers.length === undefined || $scope.partyMembers.length < 1) {
            for (var index = 0; index < $scope.partyMembers.length; index++) {
                var memberShare = calcPlayerShare($scope.partyMembers[index]);
                $scope.totalShare += memberShare;
                $scope.partyMembers[index].expShare = memberShare;
            }
            var characterShare = calcPlayerShare($scope.player);
            $scope.totalShare += characterShare;
            $scope.player.expShare = characterShare;
        };

        $scope.getPercentExp = function (partyMember) {
            return (partyMember.expShare / $scope.totalShare * 100).toFixed(2);
        };

        $scope.addPartyMember = function () {
            if ($scope.partyMembers.length < 6) {
                $scope.partyMembers.push({
                    playerLevel: $scope.player.playerLevel
                });
            }
            $scope.calcPartyShare();
        };
        $scope.removePartyMember = function (idx) {
            $scope.partyMembers.splice(idx, 1);
            $scope.calcPartyShare();
        };
        $scope.getLevelRanges();
        $scope.calcPartyShare();
        $scope.showTooltip = function (zoneLevel) {
            var tempResult = "<ul>";
            for (var idx = 0; idx < $scope.zoneData.length; idx++) {
                if (zoneLevel === $scope.zoneData[idx].map) {
                    tempResult += "<li>" + ($scope.zoneData[idx].zone) + "</li>";
                }
                if (zoneLevel === $scope.zoneData[idx].level) {
                    tempResult += "<li>" + ($scope.zoneData[idx].zone) + "</li>";
                }
            }

            return tempResult + "</ul>";
        };

        var zoneToLevel = [];

        var mapLevels = [];
        var parseMapData = function () {
            var result = [];
            for (var idx = 0; idx < mapLevels.length; idx++) {
                result.push({
                    zone: mapLevels[idx].zone.split('(')[0],
                    map: mapLevels[idx].tier + 67
                })
            }
            return result;
        };
        $http.get('data/zonedata.json').success(function (response) {
            zoneToLevel = response;
            $http.get('data/mapdata.json').success(function (response) {
                mapLevels = response;
                $scope.zoneData = calcZoneAndMapData();
            });
        });
        function calcZoneAndMapData() {
            var result = [];
            for (var idx = 0; idx < zoneToLevel.length; idx++) {
                var data = zoneToLevel[idx];
                result.push({
                        zone: data.zone,
                        level: data.levels
                        /*cruel: parseInt(subData[1].trim(), 10),
                        merciless: parseInt(subData[2].trim(), 10)*/
                });
            }
            return result.concat(parseMapData());
        }

        $scope.zoneData = calcZoneAndMapData();
    }])
;