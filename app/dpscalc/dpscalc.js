'use strict';

angular.module('myApp.dpscalc', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/dpscalc', {
            templateUrl: 'dpscalc/dpscalc.html',
            controller: 'DPSCalcCtrl'
        });
    }])

    .controller('DPSCalcCtrl', ['$scope', function ($scope) {
        var self = this;
        var augementedType = {
            NONE: 'NONE',
            FLAT_PHYS: 'FLAT_PHYS',
            PERCENT_PHYS: 'PERCENT_PHYS',
            ATTACK_SPEED: 'ATTACK_SPEED'
        };
        $scope.unparsedText = "";
        $scope.currentStats = {
            minDamage: 1,
            maxDamage: 1,
            attackSpeed: 1.0,
            critChance: 0,
            dps: 0
        };
        $scope.calculatedStats = {
            baseDamageMin: 0,
            baseDamageMax: 0,
            craftedDps: 0
        };
        $scope.upperStats = {
            minPhysDamage: 0,
            maxPhysDamage: 0,
            minLightningDamage: 0,
            maxLightningDamage: 0,
            minFireDamage: 0,
            maxFireDamage: 0,
            minColdDamage: 0,
            maxColdDamage: 0,
            attackSpeed: 1.0,
            critChance: 0
        };
        $scope.lowerStats = {
            enhancedDamage: 0,
            minPhysDamage: 0,
            maxPhysDamage: 0,
            percentAttackSpeed: 0,
            percentCritChance: 0,
            quality: 0
        };

        $scope.categories = [{
            name: 'flatPhysDamage',
            type: augementedType.FLAT_PHYS,
            data: [{
                name: 'none',
                data: {
                    valueLowerMin: 0,
                    valueLowerMax: 0,
                    valueUpperMin: 0,
                    valueUpperMax: 0
                }
            }, {
                name: '1Hand 7-9 to 13-16',
                data: {
                    valueLowerMin: 7,
                    valueLowerMax: 9,
                    valueUpperMin: 13,
                    valueUpperMax: 16
                }
            }, {
                name: '2Hand 10-13 to 20-25',
                data: {
                    valueLowerMin: 10,
                    valueLowerMax: 13,
                    valueUpperMin: 20,
                    valueUpperMax: 25
                }

            }, {
                name: '1Hand 10-13 to 17-20',
                data: {
                    valueLowerMin: 10,
                    valueLowerMax: 13,
                    valueUpperMin: 17,
                    valueUpperMax: 20
                }
            }, {
                name: '2Hand 14-18 to 26-31',
                data: {
                    valueLowerMin: 14,
                    valueLowerMax: 18,
                    valueUpperMin: 26,
                    valueUpperMax: 31
                }
            }]
        }, {
            name: 'increasedPhysDamage',
            type: augementedType.PERCENT_PHYS,
            data: [{
                name: 'none',
                data: {
                    valueLower: 0,
                    valueUpper: 0
                }
            }, {
                name: '40-59% increased Physical Damage',
                data: {
                    valueLower: 40,
                    valueUpper: 59
                }
            }, {
                name: '60-79% increased Physical Damage',
                data: {
                    valueLower: 60,
                    valueUpper: 79
                }
            }]
        }, {
            name: 'attackSpeed',
            type: augementedType.ATTACK_SPEED,
            data: [{
                name: 'none',
                data: {
                    valueLower: 0,
                    valueUpper: 0
                }
            }, {
                name: '8-11% increased Attack Speed',
                data: {
                    valueLower: 8,
                    valueUpper: 11
                }
            }, {
                name: '12-15% increased Attack Speed',
                data: {
                    valueLower: 12,
                    valueUpper: 15
                }
            }]
        }];
        $scope.selectedCategory = $scope.categories[0];
        $scope.selectedSubCategory = $scope.selectedCategory.data[0];
        $scope.updateCategorySelection = function () {
            $scope.selectedSubCategory = $scope.selectedCategory.data[0];
            console.log('selected Category: ', $scope.selectedCategory);
            console.log('selected Sub: ', $scope.selectedSubCategory);
            $scope.calculateDamage();
        };
        $scope.calculateDamage = function () {
            //self.dps = (self.minDamage + self.maxDamage) / self.attackSpeed;
            var deepz = ($scope.upperStats.minPhysDamage + $scope.upperStats.maxPhysDamage);
            deepz += ($scope.upperStats.minLightningDamage + $scope.upperStats.maxLightningDamage);
            deepz += ($scope.upperStats.minFireDamage + $scope.upperStats.maxFireDamage);
            deepz += ($scope.upperStats.minColdDamage + $scope.upperStats.maxColdDamage);
            deepz *= $scope.upperStats.attackSpeed / 2;
            console.log(deepz);
            var incDamageSum = 100 + $scope.lowerStats.enhancedDamage + $scope.lowerStats.quality;
            var baseDamageMin = $scope.upperStats.minPhysDamage / (incDamageSum / 100) - $scope.lowerStats.minPhysDamage;
            var baseDamageMax = $scope.upperStats.maxPhysDamage / (incDamageSum / 100) - $scope.lowerStats.maxPhysDamage;
            console.log(baseDamageMin);
            console.log(baseDamageMax);
            var flatPhys = baseDamageMin + baseDamageMax;
            if ($scope.selectedCategory.type === augementedType.FLAT_PHYS) {
                var avg = $scope.getAvg($scope.selectedSubCategory.data);
                console.log('avg', avg);
                flatPhys += avg;
            }
            var attackSpeed = $scope.upperStats.attackSpeed;
            if ($scope.selectedCategory.type === augementedType.ATTACK_SPEED) {
                var attackSpeed2 = ($scope.selectedSubCategory.data.valueLower + $scope.selectedSubCategory.data.valueUpper) / 2 / 100;
                console.log('attspd', attackSpeed2);
                attackSpeed += attackSpeed2;
            }
            if ($scope.selectedCategory.type === augementedType.PERCENT_PHYS) {
                var incDamageSum2 = ($scope.selectedSubCategory.data.valueLower + $scope.selectedSubCategory.data.valueUpper) / 2;
                console.log('incD', incDamageSum2);
                incDamageSum += incDamageSum2;
            }
            $scope.calculatedStats.dps = deepz;
            $scope.calculatedStats.craftedDps = flatPhys * attackSpeed * incDamageSum / 2 / 100;
        };
        $scope.getAvg = function (data) {
            return (data.valueLowerMax + data.valueLowerMax + data.valueUpperMax + data.valueUpperMin) / 2;
        };
        $scope.calculateDamage();
    }]);
