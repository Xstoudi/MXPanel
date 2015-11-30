var ngApp = angular.module("mxpanel", ["ngRoute"]);
ngApp.config(function ($routeProvider) {
    $routeProvider
        .when("/login", {
        templateUrl: "/login"
    })
        .when("/overview", {
        templateUrl: "/overview"
    })
        .otherwise("/login");
})
    .controller("loginController", function ($scope, $location, $window) {
    $scope.hideBadPassword = function () {
        document.querySelector("#badPasswordAlert").style.display = "none";
    };
    $scope.submit = function () {
        function onError(jqXHR, textStatus, errorThrown) {
            console.log("Error !" + textStatus);
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
                console.log("Error !" + textStatus);
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
        // Postfix
        $.ajax({
            type: "get",
            url: "/server/postfix",
            dataType: "json",
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error !" + textStatus);
            },
            success: function (data, textStatus, jqXHR) {
                document.querySelector("#status-postfix").innerHTML = " " + (data.status == "ok" ? "OK" : "DOWN");
            }
        });
        // Dovecot
        $.ajax({
            type: "get",
            url: "/server/dovecot",
            dataType: "json",
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error !" + textStatus);
            },
            success: function (data, textStatus, jqXHR) {
                document.querySelector("#status-dovecot").innerHTML = " " + (data.status == "ok" ? "OK" : "DOWN");
            }
        });
    };
    $scope.sendCommand = function (command, server) {
        $.ajax({
            type: "post",
            url: "/server/" + server + "/" + command,
            dataType: "json",
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error !" + textStatus);
            },
            success: function (data, textStatus, jqXHR) {
                alert("OK " + data);
            }
        });
    };
    $scope.refreshStatus();
});
