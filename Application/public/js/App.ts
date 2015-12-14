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
		.when("/logs", {
			templateUrl: "/logs"
		})
		.when("/domains", {
			templateUrl: "/domains"
		})
		.when("/aliases", {
			templateUrl: "/aliases"
		})
		.when("/change-password", {
			templateUrl: "/change-password"
		})
		.otherwise("/login");
})
.controller("loginController", ($scope, $location, $window, $rootScope) => {
	$scope.hideBadPassword = () => {
		(<HTMLElement>document.querySelector("#badPasswordAlert")).style.display = "none";
	}
	$scope.submit = () => {
		function onError(jqXHR: JQueryXHR, textStatus: string, errorThrown: string){
			console.log("Error ! " + textStatus);
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
				console.log("Error ! " + textStatus);
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
				console.log("Error ! " + textStatus);
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
				console.log("Error ! " + textStatus);
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
				console.log("Error ! " + textStatus);
			},
			success: (data: any, textStatus: string, jqXHR: JQueryXHR) => {
				$scope.refreshStatus();
			}
		});
	}

	$scope.refreshStatus();
})
.controller("usersController", ($scope, $location, $route, $templateCache) => {
	let links = $("#manage-btn-control #new-user-input #domain-selection .dropdown-menu a");
    links.each((i, link) => {
        let linkBis = $(link);
        linkBis.on("click", function(){
            $("#domain-selection-button").html(linkBis.html())
        });
    });

	$templateCache.removeAll();

	$scope.logout = () => {
		$.ajax({
			type: "post",
			url: "/logout",
			dataType: "json",
			error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
				console.log("Error ! " + textStatus);
			},
			success: (data: any, textStatus: string, jqXHR: JQueryXHR) => {
				let currentPageTemplate = $route.current.templateUrl;
				$templateCache.remove(currentPageTemplate);
				$location.path("/login").replace();
				$scope.$apply();
			}
		});
	}

	$scope.deleteUser = (id: number) => {
		$.ajax({
			type: "delete",
			url: `/users/delete/${id}`,
			dataType: "json",
			error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
				console.log("Error ! " + errorThrown);
			},
			success: (data: any, textStatus: string, jqXHR: JQueryXHR) => {
				let toRemove = document.querySelector(`#user-${id}`);
				toRemove.parentNode.removeChild(toRemove);
			}
		});
	}

	$scope.hideError = () => {
		(<HTMLElement>document.querySelector("#errorAddingUser")).style.display = "none";
	}

	$scope.createUser = () => {
		let username = (<HTMLInputElement>document.querySelector("#new-user-input input")).value;
		let pass = (<HTMLInputElement>document.querySelector("#password input")).value;
		let passRepeat = (<HTMLInputElement>document.querySelector("#password-repeat input")).value;
		let domain = $("#manage-btn-control #new-user-input #domain-selection .dropdown-menu a").html();

		$.ajax({
			type: "post",
			url: `/users/create`,
			dataType: "json",
			data: {username: username, pass: pass, passRepeat: passRepeat, domain: domain},
			error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
				console.log("Error ! " + errorThrown);
			},
			success: (data: any, textStatus: string, jqXHR: JQueryXHR) => {
				(<HTMLElement>document.querySelector("#errorText")).innerHTML = `&nbsp;&nbsp;&nbsp;${data.message}`;
				(<HTMLElement>document.querySelector("#errorAddingUser")).style.display = "block";
				if(data.message.indexOf("created") != -1) location.reload(true);
			}
		});
	}
})
.controller("logsController", ($scope, $templateCache, $location, $route) => {
	$templateCache.removeAll();

	$scope.logout = () => {
		$.ajax({
			type: "post",
			url: "/logout",
			dataType: "json",
			error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
				console.log("Error ! " + textStatus);
			},
			success: (data: any, textStatus: string, jqXHR: JQueryXHR) => {
				let currentPageTemplate = $route.current.templateUrl;
				$templateCache.remove(currentPageTemplate);
				$location.path("/login").replace();
				$scope.$apply();
			}
		});
	}
})
.controller("domainsController", ($scope, $templateCache, $location, $route) => {
	$templateCache.removeAll();
	$scope.deleteDomain = (id: number) => {
		if(confirm("WARNING ! You are going to delete a domain and all users associed, are you sure ?"))
			$.ajax({
				type: "delete",
				url: `/domains/delete/${id}`,
				dataType: "json",
				error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
					console.log("Error ! " + errorThrown);
				},
				success: (data: any, textStatus: string, jqXHR: JQueryXHR) => {
					let toRemove = document.querySelector(`#domain-${id}`);
					toRemove.parentNode.removeChild(toRemove)
				}
			});
	}

	$scope.createDomain = () => {
		let domain = (<HTMLInputElement>document.querySelector("#new-domain input")).value;

		$.ajax({
			type: "post",
			url: `/domains/create`,
			dataType: "json",
			data: {domain: domain},
			error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
				console.log("Error ! " + errorThrown);
			},
			success: (data: any, textStatus: string, jqXHR: JQueryXHR) => {
				(<HTMLElement>document.querySelector("#errorText")).innerHTML = `&nbsp;&nbsp;&nbsp;${data.message}`;
				(<HTMLElement>document.querySelector("#errorAddingDomain")).style.display = "block";
				if(data.message.indexOf("created") != -1) location.reload(true);
			}
		});
	}

	$scope.hideError = () => {
		(<HTMLElement>document.querySelector("#errorAddingDomain")).style.display = "none";
	}

	$scope.logout = () => {
		$.ajax({
			type: "post",
			url: "/logout",
			dataType: "json",
			error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
				console.log("Error ! " + textStatus);
			},
			success: (data: any, textStatus: string, jqXHR: JQueryXHR) => {
				let currentPageTemplate = $route.current.templateUrl;
				$templateCache.remove(currentPageTemplate);
				$location.path("/login").replace();
				$scope.$apply();
			}
		});
	}
})
.controller("aliasesController", ($scope, $templateCache, $route, $location) => {
	$templateCache.removeAll();

	$scope.logout = () => {
		$.ajax({
			type: "post",
			url: "/logout",
			dataType: "json",
			error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
				console.log("Error ! " + textStatus);
			},
			success: (data: any, textStatus: string, jqXHR: JQueryXHR) => {
				let currentPageTemplate = $route.current.templateUrl;
				$templateCache.remove(currentPageTemplate);
				$location.path("/login").replace();
				$scope.$apply();
			}
		});
	}

	$scope.deleteAlias = (id: number) => {
		$.ajax({
			type: "delete",
			url: `/aliases/delete/${id}`,
			dataType: "json",
			error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
				console.log("Error ! " + errorThrown);
			},
			success: (data: any, textStatus: string, jqXHR: JQueryXHR) => {
				let toRemove = document.querySelector(`#alias-${id}`);
				toRemove.parentNode.removeChild(toRemove);
			}
		});
	}

	$scope.hideError = () => {
		(<HTMLElement>document.querySelector("#errorAddingAlias")).style.display = "none";
	}

	$scope.createAlias = () => {
		let alias = (<HTMLInputElement>document.querySelector("#new-alias-input input")).value;
		let destination = (<HTMLInputElement>document.querySelector("#new-destination-input input")).value;

		$.ajax({
			type: "post",
			url: `/aliases/create`,
			dataType: "json",
			data: {alias: alias, destination: destination},
			error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
				console.log("Error ! " + errorThrown);
			},
			success: (data: any, textStatus: string, jqXHR: JQueryXHR) => {
				(<HTMLElement>document.querySelector("#errorText")).innerHTML = `&nbsp;&nbsp;&nbsp;${data.message}`;
				(<HTMLElement>document.querySelector("#errorAddingAlias")).style.display = "block";
				if(data.message.indexOf("created") != -1) location.reload(true);
			}
		});
	}
})
.controller("changePasswordController", ($scope, $templateCache, $route, $location) => {
	$scope.changePassword = () => {
		$.ajax({
			type: "post",
			url: `/change-password`,
			dataType: "json",
			data: {email: $scope.email, oldPassword: $scope.oldPassword, newPassword: $scope.newPassword, newPasswordConf: $scope.newPasswordConf},
			error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
				console.log("Error ! " + errorThrown);
			},
			success: (data: any, textStatus: string, jqXHR: JQueryXHR) => {
				(<HTMLElement>document.querySelector("#errorText")).innerHTML = `&nbsp;&nbsp;&nbsp;${data.message}`;
				(<HTMLElement>document.querySelector("#errorChangingPassword")).style.display = "block";
			}
		});
	} 
})
.controller("footerController", ($scope) => {
	$scope.makeCoffee = () => {
		window.open("/img/coffee.jpg", "MsgWindow", "width=800, height=800");
	}
})