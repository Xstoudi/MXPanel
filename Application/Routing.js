var Configuration_1 = require("./Configuration");
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
        function post(req, res) {
            if (req.body.password === Configuration_1["default"].getPanelPassword()) {
                res.status(200).send({ result: "ok" });
            }
            else {
                res.status(200).send({ result: "nope" });
            }
        }
        Login.post = post;
    })(Login = Routing.Login || (Routing.Login = {}));
    var Overview;
    (function (Overview) {
        function get(req, res) {
            res.render("partials/manage/overview");
        }
        Overview.get = get;
    })(Overview = Routing.Overview || (Routing.Overview = {}));
})(Routing = exports.Routing || (exports.Routing = {}));
exports.__esModule = true;
exports["default"] = Routing;
