var Logger_1 = require("./Logger");
var Configuration_1 = require("./Configuration");
var childProcess = require("child_process");
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
            if (req.session.logged)
                res.render("partials/manage/overview");
            else
                res.render("partials/login");
        }
        Login.get = get;
        function post(req, res) {
            if (req.body.password === Configuration_1["default"].getPanelPassword()) {
                var sess = req.session;
                sess.logged = true;
                res.status(200).send({ result: "ok" });
                Logger_1["default"].log(req.ip + " logged on panel");
            }
            else {
                res.status(200).send({ result: "nope" });
                Logger_1["default"].log(req.ip + " tried to log on panel");
            }
        }
        Login.post = post;
    })(Login = Routing.Login || (Routing.Login = {}));
    var Logout;
    (function (Logout) {
        function post(req, res) {
            req.session.logged = undefined;
            res.status(200).send({ result: "ok" });
        }
        Logout.post = post;
    })(Logout = Routing.Logout || (Routing.Logout = {}));
    var Overview;
    (function (Overview) {
        function get(req, res) {
            console.log(req.session.logged);
            if (req.session.logged)
                res.render("partials/manage/overview");
            else
                res.render("partials/login");
        }
        Overview.get = get;
    })(Overview = Routing.Overview || (Routing.Overview = {}));
    var Server;
    (function (Server) {
        var Postfix;
        (function (Postfix) {
            // Get postfix status
            function get(req, res) {
                if (req.session.logged)
                    childProcess.exec("service postfix status", function (err, stdout, stderr) {
                        res.status(200).send({ status: stdout.toString("utf-8").indexOf("running") != -1 && !Logger_1["default"].err(err) ? "ok" : "down" });
                    });
                else
                    res.status(403).send({ please: "go hell" });
            }
            Postfix.get = get;
            // Post postfix command (start, reboot, stop)
            function post(req, res) {
            }
            Postfix.post = post;
        })(Postfix = Server.Postfix || (Server.Postfix = {}));
        var Dovecot;
        (function (Dovecot) {
            // Get dovecot status
            function get(req, res) {
                if (req.session.logged)
                    childProcess.exec("service dovecot status", function (err, stdout, stderr) {
                        res.status(200).send({ status: stdout.toString("utf-8").indexOf("running") != -1 && !Logger_1["default"].err(err) ? "ok" : "down" });
                    });
                else
                    res.status(403).send({ please: "go hell" });
            }
            Dovecot.get = get;
            // Post dovecot command (start, reboot, stop)
            function post(req, res) {
            }
            Dovecot.post = post;
        })(Dovecot = Server.Dovecot || (Server.Dovecot = {}));
    })(Server = Routing.Server || (Routing.Server = {}));
})(Routing = exports.Routing || (exports.Routing = {}));
exports.__esModule = true;
exports["default"] = Routing;
