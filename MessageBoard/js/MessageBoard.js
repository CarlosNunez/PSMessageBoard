(function ($) { 

    var messageBoard = angular.module('messageBoard', []);

    messageBoard.config(function ($routeProvider) {
        $routeProvider.when('/', {
            controller: "topicsController",
            templateUrl: "/templates/topicsView.html"
        })
    });

    messageBoard.controller('homeIndexController', ['$scope', '$http' , function ($scope, $http) {
        $scope.dataCount = 0;
        $scope.data = [];
        $scope.isBusy = true;

        $http.get('/api/topics?includeReplies=true')
            .then(function (result) {
                angular.copy(result.data, $scope.data);
                
            },
            function () {
                alert('could not load topics')
            }).then(function () {
                $scope.isBusy = false;
            }
            );

    }]);

})(jQuery);