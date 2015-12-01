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
        .otherwise("/login");
})
    .controller("loginController", function ($scope, $location, $window) {
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
                location.reload(true);
            }
        });
    };
});
