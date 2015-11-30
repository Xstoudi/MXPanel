let ngApp = angular.module("mxpanel", ["ngRoute"]);
ngApp.config(($routeProvider) => {
	$routeProvider
		.when("/login", {
			templateUrl: "/login"
		})
		.when("/overview", {
			templateUrl: "/overview"
		})
		.when("/users", {
			templateUrl: "/users"
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
.controller("overviewController", ($scope, $location, $route, $templateCache) => {
	$scope.logout = () => {
		$.ajax({
			type: "post",
			url: "/logout",
			dataType: "json",
			error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
				console.log("Error !" + textStatus);
			},
			success: (data: any, textStatus: string, jqXHR: JQueryXHR) => {
				let currentPageTemplate = $route.current.templateUrl;
				$templateCache.remove(currentPageTemplate);
				$location.path("/login").replace();
				$scope.$apply();
			}
		});
	}
	
	$scope.refreshStatus = () => {
		let refreshing = [true, true];
		document.querySelector("#refreshSpin").className += " fa-spin";
		// Postfix
		$.ajax({
			type: "get",
			url: "/server/postfix",
			dataType: "json",
			error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
				console.log("Error !" + textStatus);
			},
			success: (data: any, textStatus: string, jqXHR: JQueryXHR) => {
				(<HTMLElement>document.querySelector("#status-postfix")).innerHTML = " " + (data.status == "ok" ? "OK" : "DOWN");
				refreshing[0] = false;
				setTimeout(update, 950);
			}
		});
		
		// Dovecot
		$.ajax({
			type: "get",
			url: "/server/dovecot",
			dataType: "json",
			error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
				console.log("Error !" + textStatus);
			},
			success: (data: any, textStatus: string, jqXHR: JQueryXHR) => {
				(<HTMLElement>document.querySelector("#status-dovecot")).innerHTML = " " + (data.status == "ok" ? "OK" : "DOWN");
				refreshing[1] = false;
				setTimeout(update, 950);
			}
		});
		function update(){
			if(!refreshing[0] && !refreshing[1]){
				document.querySelector("#refreshSpin").className = document.querySelector("#refreshSpin").className.split("fa-spin").join("");
			}else{
				setInterval(update, 950);
			}
		}
	}
	
	$scope.sendCommand = (command: string, server: string) => {
		$.ajax({
			type: "post",
			url: `/server/${server}/${command}`,
			dataType: "json",
			error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
				console.log("Error !" + textStatus);
			},
			success: (data: any, textStatus: string, jqXHR: JQueryXHR) => {
				$scope.refreshStatus();
			}
		});
	}
	
	$scope.refreshStatus();
})
.controller("usersController", ($scope) => {
	let links = $("#manage-btn-control #new-user-input #domain-selection .dropdown-menu a");
    links.each((i, link) => {
        let linkBis = $(link);
        linkBis.on("click", function(){
            $("#domain-selection-button").html(linkBis.html())
        });
    });

    let addButton = $("#manage-btn-control .btn-success");
    addButton.on("click", (e) => {
        if($("#password input").val() != $("#password-repeat input").val()){
            alert("Les mots de passe doivent correspondre !");
        } else {
            //fait ce que tu veux :D
        }
    });
})