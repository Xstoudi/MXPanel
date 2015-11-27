let ngApp = angular.module("mxpanel", ["ngRoute"]);
ngApp.config(($routeProvider) => {
	$routeProvider
		.when("/", {
			templateUrl: "/"
		})
		.otherwise("/");
});