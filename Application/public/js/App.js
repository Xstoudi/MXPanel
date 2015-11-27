var ngApp = angular.module("mxpanel", ["ngRoute"]);
ngApp.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
        templateUrl: "/"
    })
        .otherwise("/");
});
