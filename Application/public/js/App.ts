let ngApp = angular.module("mxpanel", ["ngRoute"]);
ngApp.config(($routeProvider) => {
	$routeProvider
		.when("/login", {
			templateUrl: "/login"
		})
		.when("/overview", {
			templateUrl: "/overview"
		})
		.otherwise("/login");
})
.controller("loginController", ($scope, $location, $window) => {
	$scope.hideBadPassword = () => {
		(<HTMLElement>document.querySelector("#badPasswordAlert")).style.display = "none";
	}
	$scope.submit = () => {
		function onError(jqXHR: JQueryXHR, textStatus: string, errorThrown: string){
			console.log("Error !" + textStatus);
		}
		function onSuccess(data: any, textStatus: string, jqXHR: JQueryXHR){
			if(data.result == "ok"){
				if($location.path() != "/login"){
					$window.location.reload();
				}else{
					console.log("YOLO");
					$location.path("/overview").replace();
					$scope.$apply();
				}
			}else{
				(<HTMLElement>document.querySelector("#badPasswordAlert")).style.display = "block";
			}	
		}
		
		let password: string = $scope.password;
		$.ajax({
			type: "post",
			url: "/login",
			dataType: "json",
			data: {password: password},
			error: onError,
			success: onSuccess
		});
	}
	
})
