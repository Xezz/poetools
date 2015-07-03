'use strict';

angular.module('myApp.expCalc', ['ngRoute', 'ui.bootstrap'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/expCalc', {
            templateUrl: 'expCalc/expCalc.html',
            controller: 'ExpCalcCtrl'
        });
    }])

    .controller('ExpCalcCtrl', ['$scope', function ($scope) {
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
        var calculateExpPenalty = function (playerLevel, zoneLevel) {
            var maxMonsterLevel = playerLevel + Math.abs(playerLevel - zoneLevel);
            var result = Math.pow(maxMonsterLevel / (maxMonsterLevel + Math.pow(calcPlayerLevelToEffectiveLevel(playerLevel, zoneLevel), 2.5)), 1.5) * 100;

            return result - result % 1;
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
            for (var zoneLevel = minDif; zoneLevel <= maxDif; zoneLevel++) {
                result.push({
                    level: zoneLevel,
                    expPercentage: calculateExpPenalty($scope.player.playerLevel, zoneLevel)
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
                if (zoneLevel === $scope.zoneData[idx].merciless) {
                    tempResult += "<li>" + ($scope.zoneData[idx].zone + " (M)") + "</li>";
                }
                else if (zoneLevel === $scope.zoneData[idx].cruel) {
                    tempResult += "<li>" + ($scope.zoneData[idx].zone + " (C)") + "</li>";
                }
                else if (zoneLevel === $scope.zoneData[idx].normal) {
                    tempResult += "<li>" + ($scope.zoneData[idx].zone + " (N)") + "</li>";
                }
            }

            return tempResult + "</ul>";
        };
        var zoneToLevel = [
            {
                "zone": "Lioneye's Watch",
                "levels": "13 / 44 / 59"
            },
            {
                "zone": "The Twilight Strand",
                "levels": "1 / 40 / 56"
            },
            {
                "zone": "The Coast",
                "levels": "2 / 40 / 56"
            },
            {
                "zone": "The Tidal Island",
                "levels": "3 / 42 / 57"
            },
            {
                "zone": "The Mud Flats",
                "levels": "4 / 41 / 56"
            },
            {
                "zone": "The Fetid Pool",
                "levels": "5 / 43 / 57"
            },
            {
                "zone": "The Flooded Depths",
                "levels": "6 / 41 / 57"
            },
            {
                "zone": "The Submerged Passage",
                "levels": "5 / 41 / 56"
            },
            {
                "zone": "The Ledge",
                "levels": "6 / 42 / 56"
            },
            {
                "zone": "The Climb",
                "levels": "7 / 42 / 56"
            },
            {
                "zone": "The Lower Prison\nThe Upper Prison",
                "levels": "8 / 42 / 56\n9 / 43 / 57"
            },
            {
                "zone": "Prisoner's Gate",
                "levels": "10 / 43 / 57"
            },
            {
                "zone": "The Ship Graveyard",
                "levels": "11 / 43 / 57"
            },
            {
                "zone": "The Ship Graveyard Cave",
                "levels": "12 / 45 / 58"
            },
            {
                "zone": "The Cavern of Wrath\nThe Cavern of Anger",
                "levels": "12 / 43 / 58\n13 / 44 / 59"
            },
            {
                "zone": "The Forest Encampment",
                "levels": "23 / 48 / 62"
            },
            {
                "zone": "The Southern Forest",
                "levels": "13 / 44 / 59"
            },
            {
                "zone": "The Old Fields",
                "levels": "14 / 45 / 60"
            },
            {
                "zone": "The Den",
                "levels": "15 / 46 / 60"
            },
            {
                "zone": "The Crossroads",
                "levels": "15 / 46 / 60"
            },
            {
                "zone": "The Crypt Level 1\nThe Crypt Level 2",
                "levels": "17 / 46 / 60\n18 / 46 / 61"
            },
            {
                "zone": "The Chamber of Sins Level 1\nThe Chamber of Sins Level 2",
                "levels": "15 / 46 / 60\n16 / 46 / 61"
            },
            {
                "zone": "The Broken Bridge",
                "levels": "16 / 46 / 61"
            },
            {
                "zone": "The Riverways",
                "levels": "15 / 45 / 60"
            },
            {
                "zone": "The Northern Forest",
                "levels": "21 / 47 / 61"
            },
            {
                "zone": "The Western Forest",
                "levels": "17 / 46 / 61"
            },
            {
                "zone": "The Weaver's Chambers",
                "levels": "18 / 46 / 61"
            },
            {
                "zone": "The Vaal Ruins",
                "levels": "20 / 47 / 61"
            },
            {
                "zone": "The Wetlands",
                "levels": "19 / 46 / 61"
            },
            {
                "zone": "The Dread Thicket",
                "levels": "21 / 48 / 63"
            },
            {
                "zone": "The Caverns\nThe Ancient Pyramid",
                "levels": "22 / 47 / 62\n23 / 48 / 63"
            },
            {
                "zone": "The Fellshrine Ruins",
                "levels": "16 / 46 / 60"
            },
            {
                "zone": "The Eternal Laboratory",
                "levels": "68 / 68 / 68"
            },
            {
                "zone": "The Sarn Encampment",
                "levels": "33 / 54 / 62"
            },
            {
                "zone": "The City of Sarn",
                "levels": "23 / 48 / 63"
            },
            {
                "zone": "The Slums\nThe Slums Sewers",
                "levels": "24 / 49 / 63\n25 / 49 / 63"
            },
            {
                "zone": "The Crematorium",
                "levels": "25 / 49 / 63"
            },
            {
                "zone": "The Warehouse District\nThe Warehouse Sewers",
                "levels": "26 / 49 / 63\n26 / 49 / 63"
            },
            {
                "zone": "The Marketplace\nThe Market Sewers",
                "levels": "26 / 49 / 63\n27 / 50 / 65"
            },
            {
                "zone": "The Catacombs",
                "levels": "27 / 52 / 67"
            },
            {
                "zone": "The Battlefront",
                "levels": "27 / 50 / 64"
            },
            {
                "zone": "The Solaris Temple Level 1",
                "levels": "27 / 50 / 64"
            },
            {
                "zone": "The Solaris Temple Level 2",
                "levels": "28 / 51 / 64"
            },
            {
                "zone": "The Docks",
                "levels": "29 / 51 / 64"
            },
            {
                "zone": "The Ebony Barracks",
                "levels": "29 / 51 / 64"
            },
            {
                "zone": "The Lunaris Temple Level 1",
                "levels": "29 / 51 / 64"
            },
            {
                "zone": "The Lunaris Temple Level 2",
                "levels": "30 / 52 / 65"
            },
            {
                "zone": "The Library\nThe Archives",
                "levels": "30 / 53 / 66\n31 / 53 / 66"
            },
            {
                "zone": "The Sceptre of God\nThe Upper Sceptre of God",
                "levels": "32 / 53 / 66\n33 / 54 / 67"
            },
            {
                "zone": "The Slums Sewers",
                "levels": "25 / 49 / 63"
            },
            {
                "zone": "The Warehouse Sewers",
                "levels": "26 / 49 / 63"
            },
            {
                "zone": "The Market Sewers",
                "levels": "27 / 50 / 65"
            },
            {
                "zone": "Highgate",
                "levels": "40 / 57 / 62"
            },
            {
                "zone": "The Aqueduct",
                "levels": "33 / 54 / 67"
            },
            {
                "zone": "The Dried Lake",
                "levels": "34 / 55 / 67"
            },
            {
                "zone": "The Mines Level 1\nThe Mines Level 2",
                "levels": "34 / 55 / 67\n35 / 55 / 67"
            },
            {
                "zone": "The Crystal Veins",
                "levels": "35 / 55 / 68"
            },
            {
                "zone": "Kaom's Dream\nKaom's Path",
                "levels": "36 / 55 / 68\n37 / 55 / 68"
            },
            {
                "zone": "Kaom's Stronghold",
                "levels": "38 / 56 / 69"
            },
            {
                "zone": "Daresso's Dream",
                "levels": "37 / 55 / 68"
            },
            {
                "zone": "The Grand Arena",
                "levels": "38 / 56 / 69"
            },
            {
                "zone": "The Belly of the Beast Level 1\nThe Belly of the Beast Level 2",
                "levels": "38 / 56 / 69\n39 / 56 / 69"
            },
            {
                "zone": "The Harvest",
                "levels": "40 / 57 / 70"
            }
        ];
        $scope.zoneData = (function () {
            var result = [];
            for (var idx = 0; idx < zoneToLevel.length; idx++) {
                var data = zoneToLevel[idx];
                var baseName = data.zone.split('\n');
                var baseLevelData = data.levels.split('\n');
                for (var subIdx = 0; subIdx < baseLevelData.length && subIdx < baseName.length; subIdx++) {
                    var subName = baseName[subIdx];
                    var subData = baseLevelData[subIdx].split('/');
                    result.push({
                        zone: subName,
                        normal: parseInt(subData[0].trim(), 10),
                        cruel: parseInt(subData[1].trim(), 10),
                        merciless: parseInt(subData[2].trim(), 10)
                    })
                }
            }
            return result;
        })();
    }])
;