var ngApp = angular.module("mxpanel", ["ngRoute"]);
ngApp.config(function ($routeProvider) {
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
    .controller("loginController", function ($scope, $location, $window, $rootScope) {
    $scope.hideBadPassword = function () {
        document.querySelector("#badPasswordAlert").style.display = "none";
    };
    $scope.submit = function () {
        function onError(jqXHR, textStatus, errorThrown) {
            console.log("Error ! " + textStatus);
        }
        function onSuccess(data, textStatus, jqXHR) {
            if (data.result == "ok") {
                if ($location.path() != "/login") {
                    $window.location.reload();
                }
                else {
                    $location.path("/overview").replace();
                    $scope.$apply();
                }
            }
            else {
                document.querySelector("#badPasswordAlert").style.display = "block";
            }
        }
        var password = $scope.password;
        $.ajax({
            type: "post",
            url: "/login",
            dataType: "json",
            data: { password: password },
            error: onError,
            success: onSuccess
        });
    };
})
    .controller("overviewController", function ($scope, $location, $route, $templateCache) {
    $scope.logout = function () {
        $.ajax({
            type: "post",
            url: "/logout",
            dataType: "json",
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error ! " + textStatus);
            },
            success: function (data, textStatus, jqXHR) {
                var currentPageTemplate = $route.current.templateUrl;
                $templateCache.remove(currentPageTemplate);
                $location.path("/login").replace();
                $scope.$apply();
            }
        });
    };
    $scope.refreshStatus = function () {
        var refreshing = [true, true];
        document.querySelector("#refreshSpin").className += " fa-spin";
        // Postfix
        $.ajax({
            type: "get",
            url: "/server/postfix",
            dataType: "json",
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error ! " + textStatus);
            },
            success: function (data, textStatus, jqXHR) {
                document.querySelector("#status-postfix").innerHTML = " " + (data.status == "ok" ? "OK" : "DOWN");
                refreshing[0] = false;
                setTimeout(update, 950);
            }
        });
        // Dovecot
        $.ajax({
            type: "get",
            url: "/server/dovecot",
            dataType: "json",
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error ! " + textStatus);
            },
            success: function (data, textStatus, jqXHR) {
                document.querySelector("#status-dovecot").innerHTML = " " + (data.status == "ok" ? "OK" : "DOWN");
                refreshing[1] = false;
                setTimeout(update, 950);
            }
        });
        function update() {
            if (!refreshing[0] && !refreshing[1]) {
                document.querySelector("#refreshSpin").className = document.querySelector("#refreshSpin").className.split("fa-spin").join("");
            }
            else {
                setInterval(update, 950);
            }
        }
    };
    $scope.sendCommand = function (command, server) {
        $.ajax({
            type: "post",
            url: "/server/" + server + "/" + command,
            dataType: "json",
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error ! " + textStatus);
            },
            success: function (data, textStatus, jqXHR) {
                $scope.refreshStatus();
            }
        });
    };
    $scope.refreshStatus();
})
    .controller("usersController", function ($scope, $location, $route, $templateCache) {
    var links = $("#manage-btn-control #new-user-input #domain-selection .dropdown-menu a");
    links.each(function (i, link) {
        var linkBis = $(link);
        linkBis.on("click", function () {
            $("#domain-selection-button").html(linkBis.html());
        });
    });
    $templateCache.removeAll();
    $scope.logout = function () {
        $.ajax({
            type: "post",
            url: "/logout",
            dataType: "json",
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error ! " + textStatus);
            },
            success: function (data, textStatus, jqXHR) {
                var currentPageTemplate = $route.current.templateUrl;
                $templateCache.remove(currentPageTemplate);
                $location.path("/login").replace();
                $scope.$apply();
            }
        });
    };
    $scope.deleteUser = function (id) {
        $.ajax({
            type: "delete",
            url: "/users/delete/" + id,
            dataType: "json",
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error ! " + errorThrown);
            },
            success: function (data, textStatus, jqXHR) {
                var toRemove = document.querySelector("#user-" + id);
                toRemove.parentNode.removeChild(toRemove);
            }
        });
    };
    $scope.hideError = function () {
        document.querySelector("#errorAddingUser").style.display = "none";
    };
    $scope.createUser = function () {
        var username = document.querySelector("#new-user-input input").value;
        var pass = document.querySelector("#password input").value;
        var passRepeat = document.querySelector("#password-repeat input").value;
        var domain = $("#manage-btn-control #new-user-input #domain-selection .dropdown-menu a").html();
        $.ajax({
            type: "post",
            url: "/users/create",
            dataType: "json",
            data: { username: username, pass: pass, passRepeat: passRepeat, domain: domain },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error ! " + errorThrown);
            },
            success: function (data, textStatus, jqXHR) {
                document.querySelector("#errorText").innerHTML = "&nbsp;&nbsp;&nbsp;" + data.message;
                document.querySelector("#errorAddingUser").style.display = "block";
                if (data.message.indexOf("created") != -1)
                    location.reload(true);
            }
        });
    };
})
    .controller("logsController", function ($scope, $templateCache, $location, $route) {
    $templateCache.removeAll();
    $scope.logout = function () {
        $.ajax({
            type: "post",
            url: "/logout",
            dataType: "json",
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error ! " + textStatus);
            },
            success: function (data, textStatus, jqXHR) {
                var currentPageTemplate = $route.current.templateUrl;
                $templateCache.remove(currentPageTemplate);
                $location.path("/login").replace();
                $scope.$apply();
            }
        });
    };
})
    .controller("domainsController", function ($scope, $templateCache, $location, $route) {
    $templateCache.removeAll();
    $scope.deleteDomain = function (id) {
        if (confirm("WARNING ! You are going to delete a domain and all users associed, are you sure ?"))
            $.ajax({
                type: "delete",
                url: "/domains/delete/" + id,
                dataType: "json",
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log("Error ! " + errorThrown);
                },
                success: function (data, textStatus, jqXHR) {
                    var toRemove = document.querySelector("#domain-" + id);
                    toRemove.parentNode.removeChild(toRemove);
                }
            });
    };
    $scope.createDomain = function () {
        var domain = document.querySelector("#new-domain input").value;
        $.ajax({
            type: "post",
            url: "/domains/create",
            dataType: "json",
            data: { domain: domain },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error ! " + errorThrown);
            },
            success: function (data, textStatus, jqXHR) {
                document.querySelector("#errorText").innerHTML = "&nbsp;&nbsp;&nbsp;" + data.message;
                document.querySelector("#errorAddingDomain").style.display = "block";
                if (data.message.indexOf("created") != -1)
                    location.reload(true);
            }
        });
    };
    $scope.hideError = function () {
        document.querySelector("#errorAddingDomain").style.display = "none";
    };
    $scope.logout = function () {
        $.ajax({
            type: "post",
            url: "/logout",
            dataType: "json",
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error ! " + textStatus);
            },
            success: function (data, textStatus, jqXHR) {
                var currentPageTemplate = $route.current.templateUrl;
                $templateCache.remove(currentPageTemplate);
                $location.path("/login").replace();
                $scope.$apply();
            }
        });
    };
})
    .controller("aliasesController", function ($scope, $templateCache, $route, $location) {
    $templateCache.removeAll();
    $scope.logout = function () {
        $.ajax({
            type: "post",
            url: "/logout",
            dataType: "json",
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error ! " + textStatus);
            },
            success: function (data, textStatus, jqXHR) {
                var currentPageTemplate = $route.current.templateUrl;
                $templateCache.remove(currentPageTemplate);
                $location.path("/login").replace();
                $scope.$apply();
            }
        });
    };
    $scope.deleteAlias = function (id) {
        $.ajax({
            type: "delete",
            url: "/aliases/delete/" + id,
            dataType: "json",
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error ! " + errorThrown);
            },
            success: function (data, textStatus, jqXHR) {
                var toRemove = document.querySelector("#alias-" + id);
                toRemove.parentNode.removeChild(toRemove);
            }
        });
    };
    $scope.hideError = function () {
        document.querySelector("#errorAddingAlias").style.display = "none";
    };
    $scope.createAlias = function () {
        var alias = document.querySelector("#new-alias-input input").value;
        var destination = document.querySelector("#new-destination-input input").value;
        $.ajax({
            type: "post",
            url: "/aliases/create",
            dataType: "json",
            data: { alias: alias, destination: destination },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error ! " + errorThrown);
            },
            success: function (data, textStatus, jqXHR) {
                document.querySelector("#errorText").innerHTML = "&nbsp;&nbsp;&nbsp;" + data.message;
                document.querySelector("#errorAddingAlias").style.display = "block";
                if (data.message.indexOf("created") != -1)
                    location.reload(true);
            }
        });
    };
})
    .controller("changePasswordController", function ($scope, $templateCache, $route, $location) {
    $scope.changePassword = function () {
        $.ajax({
            type: "post",
            url: "/change-password",
            dataType: "json",
            data: { email: $scope.email, oldPassword: $scope.oldPassword, newPassword: $scope.newPassword, newPasswordConf: $scope.newPasswordConf },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error ! " + errorThrown);
            },
            success: function (data, textStatus, jqXHR) {
                document.querySelector("#errorText").innerHTML = "&nbsp;&nbsp;&nbsp;" + data.message;
                document.querySelector("#errorChangingPassword").style.display = "block";
            }
        });
    };
})
    .controller("footerController", function ($scope) {
    $scope.makeCoffee = function () {
        window.open("/img/coffee.jpg", "MsgWindow", "width=800, height=800");
    };
});
