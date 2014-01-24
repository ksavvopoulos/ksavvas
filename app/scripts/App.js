var app = angular.module('myApp', ['ngRoute', 'ngResource']);

app.config(function ($routeProvider) {
    "use strict";

    $routeProvider.
    when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
    }).
    when('/lessons', {
        templateUrl: 'views/lessons.html',
        controller: "lessonsCtrl"
    }).
    when('/addItem', {
        templateUrl: 'views/addItem.html'
    });

});


app.controller('MainCtrl', function ($scope, $q, $resource) {
    "use strict";
    var Soap = $resource('/soap'+$scope.password);

    $scope.hello = "Hello World!";

    $q.when(ind.rest.getHostLists('')).then(function (data) {
        var res = JSON.parse(data.body);

        console.log(res);

        $scope.items = res.d.results;
    });

    $scope.soap = function(){
        var res = Soap.get(function(){
            console.log(res);
        });
    };

});

app.controller('lessonsCtrl', function ($scope, $q) {
    "use strict";

    $scope.lessons = "Just a Lessons List";

    function getLessons() {
        $scope.items = [];
        $q.when(ind.rest.getHostListItems('Lessons', '$select=Title,Id')).then(function (data) {
            var res = JSON.parse(data.body);
            console.log(res);

            $scope.items = res.d.results;
        });
    }

    $scope.updateList = function () {
        $q.when(ind.rest.getHostListByTitle('Lessons1', '')).
        then(function (data) {
            var res = JSON.parse(data.body),
                listData = {
                    Title: "Lessons",
                    __metadata: res.d.__metadata
                };
            console.log(res);
            return $q.when(ind.rest.updateHostList('Lessons1', listData));
        }).
        then(function () {
            console.log("List Updated");
        });
    };

    $scope.delete = function (index, item) {
        $q.when(ind.rest.deleteHostListItem('Lessons', item.Id, item.__metadata.etag)).
        then(function () {
            $scope.items.splice(index, 1);
        }, function (error) {
            console.log(error);
        });
    };

    $scope.update = function (item) {

        var upItem = {
            Title: "new " + item.Title,
            Id: item.Id,
            __metadata: item.__metadata
        };

        $q.when(ind.rest.updateHostListItem("Lessons", upItem)).then(function (data) {
            console.log('Item Updated' + data);
            getLessons();
        }, function (error) {
            console.log(error);
        });
    };

    getLessons();
});

app.controller('addItem', function ($scope, $location, $q) {
    "use strict";

    $scope.add = function () {
        var item = {
            Title: $scope.Title,
            "__metadata": {
                type: "SP.Data.LessonsListItem"
            }
        };
        console.log(item);

        $q.when(ind.rest.addHostListItem('Lessons', item)).
        then(function (data) {
            console.log(data);

            $location.path('/lessons');

            console.log($location.path());
        }, function (error) {
            console.log(error);
        });
    };
});

//function restGetLists() {
//    var query = "$select=Title";

//    return ind.rest.getHostLists(query);
//}

//function getLessons() {
//    var lessons,context,factory,appContextSite,web,lists;


//    context = new SP.ClientContext(hostWebUrl); 
//    factory = new SP.ProxyWebRequestExecutorFactory(appWebUrl);
//    context.set_webRequestExecutorFactory(factory);
//    appContextSite = new SP.AppContextSite(context, hostWebUrl);

//    lists = appContextSite.get_web().get_lists();

//    context.loadQuery(lists);

//    context.executeQueryAsync(success, fail);


//    function success() {
//        var i, len, current, lenum;

//        console.log(lists);

//        lenum = lists.getEnumerator();

//        while (lenum.moveNext()) {
//            current = lenum.get_current();
//            console.log(current.get_title());
//        }
//    }

//    function fail(sender,args) {
//        alert('Error');
//        console.log(args.get_message());
//    }
//}

//function createCustomSite() {
//    var web = {
//        Title: "Custom Team Site",
//        Url: "CustomTeamSite",
//        language: 1033,
//        Template: "STS#0",
//        inheritPerms:true
//    };

//    ind.csom.createHostSite(web);
//}

//function createCustomLessons() {
//    ind.csom.createHostList({
//        Title: "Custom Lessons",
//        Type: SP.ListTemplateType.genericList
//    });
//}

//function createCustomClasses() {
//    var list = {
//        Title: "Custom Classes",
//        Template:100
//    };

//    ind.rest.createHostList(list,onItemSuccess,onFail);
//}

//function restGetLessons() {
//    var query = "";
//    ind.rest.getHostListByTitle('Lessons', query, onItemSuccess, onFail);
//}

//function getLessonItems() {
//    var query = "$select=Title";
//    ind.rest.getHostListItems('Lessons', query, onCollectionSuccess, onFail);
//}

//function getLessonFields() {
//    var query = "$select=Title";
//    ind.rest.getHostListFields('Lessons', query, onCollectionSuccess, onFail);
//}

//function onCollectionSuccess(data) {
//    var mes = $('#message'),
//        res = JSON.parse(data.body);

//    res.d.results.forEach(function (v) {
//        mes.append('<br/>'+v.Title);
//    });

//    console.log(res);
//}

//function onItemSuccess(data) {
//    var mes = $('#message'),
//        res = JSON.parse(data.body);

//    console.log(res);
//}

//function onFail(error) {
//    console.log(error);
//}