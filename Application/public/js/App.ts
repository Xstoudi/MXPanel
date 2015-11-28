let ngApp = angular.module("mxpanel", ["ngRoute"]);
ngApp.config(($routeProvider) => {
	$routeProvider
		.when("/login", {
			templateUrl: "/login"
		})
		.otherwise("/login");
});