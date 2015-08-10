var mobileTotalBiined = angular.module('mobileTotalBiined', ['ngRoute', 'nvd3']);

mobileTotalBiined.controller("mobileTotalBiinedController", ['$scope', '$http',
    function($scope, $http) {

        $scope.organizationId = selectedOrganization();
        $scope.currentDays = 0;

        $scope.$on('organizationsChanged', function(orgId) {
            $scope.getChartData($scope.currentDays);
        });
        
        //Turn off the Loader
        turnLoaderOff();

    }
]);