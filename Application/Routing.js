var Routing;
(function (Routing) {
    var Home;
    (function (Home) {
        function get(req, res) {
            res.render("index");
        }
        Home.get = get;
    })(Home = Routing.Home || (Routing.Home = {}));
    var Login;
    (function (Login) {
        function get(req, res) {
            res.render("partials/login");
        }
        Login.get = get;
    })(Login = Routing.Login || (Routing.Login = {}));
})(Routing = exports.Routing || (exports.Routing = {}));
exports.__esModule = true;
exports["default"] = Routing;
