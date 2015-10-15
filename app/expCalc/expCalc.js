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
        var specialMap = {
            startLevel: 77,
            endLevel: 82,
            77: 76.9, 78: 77.7, 79: 78.4, 80: 79, 81: 79.5, 82: 79.9
        };
        var startMap = 68;
        var endMap = 82;
        var calculateExpPenalty = function (playerLevel, zoneLevel) {
            if (zoneLevel >= specialMap.startLevel) {
                zoneLevel = specialMap[zoneLevel];
                console.log(zoneLevel);
            }
            var maxMonsterLevel = playerLevel + Math.abs(playerLevel - zoneLevel);
            var result = Math.pow((5 + playerLevel) / (5 + playerLevel + Math.pow(calcPlayerLevelToEffectiveLevel(playerLevel, zoneLevel), 2.5)), 1.5) * 100;
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

        var mapLevels = [
            {
                "zone": "Crypt Map(Crypt Map)",
                "level": 68
            },
            {
                "zone": "The Coward's Trial",
                "level": 68
            },
            {
                "zone": "Dungeon Map(Dungeon Map)",
                "level": 68
            },
            {
                "zone": "Grotto Map(Grotto Map)",
                "level": 68
            },
            {
                "zone": "Dunes Map(Dunes Map)",
                "level": 68
            },
            {
                "zone": "Pit Map(Pit Map)",
                "level": 68
            },
            {
                "zone": "Tropical Island Map(Tropical Island Map)",
                "level": 68
            },
            {
                "zone": "Untainted Paradise",
                "level": 68
            },
            {
                "zone": "Desert Map(Desert Map)",
                "level": 68
            },
            {
                "zone": "Sewer Map(Sewer Map)",
                "level": 69
            },
            {
                "zone": "Aqueduct Map(Aqueduct Map)",
                "level": 69
            },
            {
                "zone": "Thicket Map(Thicket Map)",
                "level": 69
            },
            {
                "zone": "Mountain Ledge Map(Mountain Ledge Map)",
                "level": 69
            },
            {
                "zone": "Maelström of Chaos",
                "level": 69
            },
            {
                "zone": "Cemetery Map(Cemetery Map)",
                "level": 69
            },
            {
                "zone": "Arcade Map(Arcade Map)",
                "level": 69
            },
            {
                "zone": "Wharf Map(Wharf Map)",
                "level": 69
            },
            {
                "zone": "Ghetto Map(Ghetto Map)",
                "level": 70
            },
            {
                "zone": "Spider Lair Map(Spider Lair Map)",
                "level": 70
            },
            {
                "zone": "Vaal Pyramid Map(Vaal Pyramid Map)",
                "level": 70
            },
            {
                "zone": "Vaults of Atziri",
                "level": 70
            },
            {
                "zone": "Reef Map(Reef Map)",
                "level": 70
            },
            {
                "zone": "Mao Kun",
                "level": 70
            },
            {
                "zone": "Quarry Map(Quarry Map)",
                "level": 70
            },
            {
                "zone": "Mud Geyser Map(Mud Geyser Map)",
                "level": 70
            },
            {
                "zone": "Museum Map(Museum Map)",
                "level": 70
            },
            {
                "zone": "Arena Map(Arena Map)",
                "level": 71
            },
            {
                "zone": "Overgrown Shrine Map(Overgrown Shrine Map)",
                "level": 71
            },
            {
                "zone": "Acton's Nightmare",
                "level": 71
            },
            {
                "zone": "Tunnel Map(Tunnel Map)",
                "level": 71
            },
            {
                "zone": "Shore Map(Shore Map)",
                "level": 71
            },
            {
                "zone": "Spider Forest Map(Spider Forest Map)",
                "level": 71
            },
            {
                "zone": "Promenade Map(Promenade Map)",
                "level": 71
            },
            {
                "zone": "Hall of Grandmasters",
                "level": 71
            },
            {
                "zone": "Underground Sea Map(Underground Sea Map)",
                "level": 72
            },
            {
                "zone": "Pier Map(Pier Map)",
                "level": 72
            },
            {
                "zone": "Bog Map(Bog Map)",
                "level": 72
            },
            {
                "zone": "Graveyard Map(Graveyard Map)",
                "level": 72
            },
            {
                "zone": "Coves Map(Coves Map)",
                "level": 72
            },
            {
                "zone": "Villa Map(Villa Map)",
                "level": 72
            },
            {
                "zone": "Temple Map(Temple Map)",
                "level": 73
            },
            {
                "zone": "Poorjoy's Asylum",
                "level": 73
            },
            {
                "zone": "Arachnid Nest Map(Arachnid Nest Map)",
                "level": 73
            },
            {
                "zone": "Strand Map(Strand Map)",
                "level": 73
            },
            {
                "zone": "Whakawairua Tuahu",
                "level": 73
            },
            {
                "zone": "Dry Woods Map(Dry Woods Map)",
                "level": 73
            },
            {
                "zone": "Colonnade Map(Colonnade Map)",
                "level": 73
            },
            {
                "zone": "Blackguard Salute",
                "level": 73
            },
            {
                "zone": "Catacomb Map(Catacomb Map)",
                "level": 73
            },
            {
                "zone": "Convent of the Twins' Flame",
                "level": 73
            },
            {
                "zone": "Torture Chamber Map(Torture Chamber Map)",
                "level": 74
            },
            {
                "zone": "Oba's Cursed Trove",
                "level": 74
            },
            {
                "zone": "Waste Pool Map(Waste Pool Map)",
                "level": 74
            },
            {
                "zone": "Mine Map(Mine Map)",
                "level": 74
            },
            {
                "zone": "Jungle Valley Map(Jungle Valley Map)",
                "level": 74
            },
            {
                "zone": "Labyrinth Map(Labyrinth Map)",
                "level": 74
            },
            {
                "zone": "Cells Map(Cells Map)",
                "level": 75
            },
            {
                "zone": "Canyon Map(Canyon Map)",
                "level": 75
            },
            {
                "zone": "Dark Forest Map(Dark Forest Map)",
                "level": 75
            },
            {
                "zone": "Dry Peninsula Map(Dry Peninsula Map)",
                "level": 75
            },
            {
                "zone": "Orchard Map(Orchard Map)",
                "level": 75
            },
            {
                "zone": "Underground River Map(Underground River Map)",
                "level": 76
            },
            {
                "zone": "Arid Lake Map(Arid Lake Map)",
                "level": 76
            },
            {
                "zone": "Gorge Map(Gorge Map)",
                "level": 76
            },
            {
                "zone": "Residence Map(Residence Map)",
                "level": 76
            },
            {
                "zone": "Necropolis Map(Necropolis Map)",
                "level": 77,
                "expLevel": 76.9
            },
            {
                "zone": "Death and Taxes",
                "level": 77,
                "expLevel": 76.9
            },
            {
                "zone": "Plateau Map(Plateau Map)",
                "level": 77,
                "expLevel": 76.9
            },
            {
                "zone": "Bazaar Map(Bazaar Map)",
                "level": 77,
                "expLevel": 76.9
            },
            {
                "zone": "Abyss Map(Abyss Map)",
                "level": 77,
                "expLevel": 76.9
            },
            {
                "zone": "Crematorium Map(Crematorium Map)",
                "level": 78,
                "expLevel": 77.7
            },
            {
                "zone": "Precinct Map(Precinct Map)",
                "level": 78,
                "expLevel": 77.7
            },
            {
                "zone": "Academy Map(Academy Map)",
                "level": 78,
                "expLevel": 77.7
            },
            {
                "zone": "Springs Map(Springs Map)",
                "level": 78,
                "expLevel": 77.7
            },
            {
                "zone": "Shipyard Map(Shipyard Map)",
                "level": 79,
                "expLevel": 78.4
            },
            {
                "zone": "Overgrown Ruin Map(Overgrown Ruin Map)",
                "level": 79,
                "expLevel": 78.4
            },
            {
                "zone": "Village Ruin Map(Village Ruin Map)",
                "level": 79,
                "expLevel": 78.4
            },
            {
                "zone": "Arsenal Map(Arsenal Map)",
                "level": 79,
                "expLevel": 78.4
            },
            {
                "zone": "Wasteland Map(Wasteland Map)",
                "level": 80,
                "expLevel": 79
            },
            {
                "zone": "Courtyard Map(Courtyard Map)",
                "level": 80,
                "expLevel": 79
            },
            {
                "zone": "Excavation Map(Excavation Map)",
                "level": 80,
                "expLevel": 79
            },
            {
                "zone": "Waterways Map(Waterways Map)",
                "level": 80,
                "expLevel": 79
            },
            {
                "zone": "Palace Map(Palace Map)",
                "level": 81,
                "expLevel": 79.5
            },
            {
                "zone": "Shrine Map(Shrine Map)",
                "level": 81,
                "expLevel": 79.5
            },
            {
                "zone": "Wraeclast Pantheon",
                "level": 81,
                "expLevel": 79.5
            },
            {
                "zone": "Maze Map(Maze Map)",
                "level": 81,
                "expLevel": 79.5
            },
            {
                "zone": "Olmec's Sanctum",
                "level": 81,
                "expLevel": 79.5
            },
            {
                "zone": "Vaal Temple Map(Vaal Temple Map)",
                "level": 81,
                "expLevel": 79.5
            },
            {
                "zone": "Core Map(Core Map)",
                "level": 82,
                "expLevel": 79.9
            },
            {
                "zone": "Volcano Map(Volcano Map)",
                "level": 82,
                "expLevel": 79.9
            },
            {
                "zone": "Colosseum Map(Colosseum Map)",
                "level": 82,
                "expLevel": 79.9
            },
            {
                "zone": "The Alluring Abyss(The Alluring Abyss)",
                "level": 80,
                "expLevel": 79
            },
            {
                "zone": "The Apex of Sacrifice(The Apex of Sacrifice)",
                "level": 70
            }
        ];
        var parseMapData = function () {
            var result = [];
            for (var idx = 0; idx < mapLevels.length; idx++) {
                result.push({
                    zone: mapLevels[idx].zone.split('(')[0],
                    map: mapLevels[idx].level
                })
            }
            return result;
        };
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
            return result.concat(parseMapData());
        })();
    }])
;