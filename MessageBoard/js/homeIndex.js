(function ($) {

    var module = angular.module("homeIndex", ['ngRoute']);

    module.config(function ($routeProvider) {
        $routeProvider.when('/', {
            controller: "topicsController",
            templateUrl: "/templates/topicsView.html"
        })

        $routeProvider.when("/newmessage", {
            controller: "newTopicController",
            templateUrl: "/templates/newTopicView.html"
        });

        $routeProvider.when("/message/:id", {
            controller: "singleTopicController",
            templateUrl: "/templates/singleTopicView.html"
        });

        $routeProvider.otherwise("/");

    });

    module.factory("dataService", function ($http, $q) {
        var _topics = [];
        var _isInit = false;
        
        var _isReady = function(){
            return _isInit;
        }

        var _getTopics = function () {

            var deferred = $q.defer();
            $http.get('/api/topics?includeReplies=true')
                .then(function (result) {
                    angular.copy(result.data, _topics);
                    _isInit = true;
                    deferred.resolve();
                },
                function () {
                    deferred.reject();
                });
            return deferred.promise;
        };

        var _addTopic = function (newTopic) {
            var deferred = $q.defer();

            $http.post("/api/topics", newTopic)
               .then(function (result) {
                   var newlyCreatedTopic = result.data;
                   _topics.splice(0,0,newlyCreatedTopic);
                   deferred.resolve(newlyCreatedTopic);
               },
               function () {
                   deferred.reject();
               });

            return deferred.promise;
        }

        function findTopic(id) {
            var found = null;

            $.each(_topics, function (i, item) {
                if (item.id == id) {
                    found = item;
                    return false;
                }
            })

            return found;
        }

        var _getTopicById = function (id) {
            var deferred = $q.defer();

            if ( _isReady() ) {
                var topic = findTopic(id);
                if (topic) {
                    deferred.resolve(topic);
                }
                else {
                    deferred.reject();
                }
            } else {
                _getTopics()
                    .then(function(){
                        var topic = findTopic(id);
                        if (topic) {
                            deferred.resolve(topic);
                        } else {
                            deferred.reject();
                        }
                    },function(){
                        deferred.reject();
                    });
            }
            return deferred.promise;

        }

        return {
            topics: _topics,
            getTopics: _getTopics,
            addTopic: _addTopic,
            isReady: _isReady,
            getTopicById: _getTopicById
        };
    });

    module.controller('topicsController', ['$scope', '$http','dataService', function ($scope, $http, dataService) {
        $scope.dataCount = 0;
        $scope.data = dataService;
        $scope.isBusy = false;

        if (dataService.isReady() == false) {
            $scope.isBusy = true;
            dataService.getTopics()
                       .then(function () {

                       },
                        function () {
                            alert("could not load topics");
                        }).then(function () {
                            $scope.isBusy = false;
                        });
        }
    }]);

    module.controller('newTopicController', ['$scope', '$http', '$window','dataService', function ($scope, $http, $window, dataService) {
        $scope.newTopic = {};

        $scope.save = function ()
        {
            dataService.addTopic($scope.newTopic)
                .then(function () {
                    //success
                    $window.location = "#/"
                },
                function () {
                    //error
                    alert("could not save new topic")
                });
        }

    }]);

    module.controller('singleTopicController', ['$scope', 'dataService', '$window', '$route', '$routeParams', function ($scope, dataService, $window, $route, $routeParams) {
        $scope.Topic = null;
        $scope.newReply = {};

        dataService.getTopicById($routeParams.id)
            .then(function (topic) {
                $scope.Topic = topic;
            },
            function () {
                window.location = "#/"
            });

        $scope.addReply = function () { }
    }]);

})(jQuery);