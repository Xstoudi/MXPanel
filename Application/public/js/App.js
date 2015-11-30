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
                    console.log("YOLO");
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
});
