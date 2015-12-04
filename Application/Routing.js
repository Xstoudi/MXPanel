var Logger_1 = require("./Logger");
var Database_1 = require("./Database");
var Configuration_1 = require("./Configuration");
var childProcess = require("child_process");
var fs = require("fs");
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
            if (req.session.logged)
                res.render("partials/manage/overview");
            else
                res.render("partials/login");
        }
        Overview.get = get;
    })(Overview = Routing.Overview || (Routing.Overview = {}));
    var Server;
    (function (Server) {
        function get(req, res) {
            if (req.session.logged && (req.params.server == "dovecot" || req.params.server == "postfix"))
                childProcess.exec("service " + req.params.server + " status", function (err, stdout, stderr) {
                    res.status(200).send({ status: stdout.toString("utf-8").indexOf("running") != -1 && !Logger_1["default"].err(err) ? "ok" : "down" });
                });
            else
                res.status(403).send({ please: "go hell" });
        }
        Server.get = get;
        // Post command (start, reboot, stop)
        function post(req, res) {
            if (req.session.logged && (req.params.server == "dovecot" || req.params.server == "postfix")) {
                switch (req.params.command) {
                    case "start":
                        childProcess.exec("service " + req.params.server + " start", function (err, stdout, stderr) {
                            res.status(200).send({ state: "done" });
                            Logger_1["default"].log(req.ip + " started " + req.params.server + "...");
                        });
                        break;
                    case "reboot":
                        childProcess.exec("service " + req.params.server + " restart", function (err, stdout, stderr) {
                            res.status(200).send({ state: "done" });
                            Logger_1["default"].log(req.ip + " rebooted " + req.params.server + "...");
                        });
                        break;
                    case "stop":
                        childProcess.exec("service " + req.params.server + " stop", function (err, stdout, stderr) {
                            res.status(200).send({ state: "done" });
                            Logger_1["default"].log(req.ip + " stopped " + req.params.server + "...");
                        });
                        break;
                }
            }
            else
                res.status(403).send({ please: "go hell" });
        }
        Server.post = post;
    })(Server = Routing.Server || (Routing.Server = {}));
    var Users;
    (function (Users) {
        function get(req, res) {
            if (req.session.logged) {
                Database_1["default"].getUsers(function (users) {
                    res.render("partials/manage/users", { users: users });
                });
            }
            else
                res.render("partials/login");
        }
        Users.get = get;
        function _delete(req, res) {
            if (req.session.logged) {
                Database_1["default"].deleteUser(req.params.id, function () {
                    res.status(200).send({});
                });
            }
            else
                res.render("partials/login");
        }
        Users._delete = _delete;
        function post(req, res) {
            if (req.session.logged) {
                var username = req.body.username;
                var pass = req.body.pass;
                var passRepeat = req.body.passRepeat;
                var domain = req.body.domain;
                if (username != undefined && username != "") {
                    if (pass != undefined && pass != "") {
                        if (pass === passRepeat) {
                            if (domain != undefined && domain != "") {
                                Database_1["default"].createUser(domain, username, pass, function (message) {
                                    res.status(200).send({ message: message });
                                });
                            }
                            else {
                                res.status(200).send({ message: "Please select a valid domain" });
                            }
                        }
                        else {
                            res.status(200).send({ message: "Passwords don't match" });
                        }
                    }
                    else {
                        res.status(200).send({ message: "Please type a valid password" });
                    }
                }
                else {
                    res.status(200).send({ message: "Please type an username" });
                }
            }
            else
                res.render("partials/login");
        }
        Users.post = post;
    })(Users = Routing.Users || (Routing.Users = {}));
    var Logs;
    (function (Logs) {
        function get(req, res) {
            if (req.session.logged) {
                fs.readFile("logs.log", function (err, data) {
                    var logs = [];
                    if (!Logger_1["default"].err(err)) {
                        var lines = data.toString("utf-8").split("\n");
                        for (var line in lines) {
                            var compo = line.split(" ");
                            logs.push({ time: compo[0] + compo[1], message: compo[2] });
                        }
                    }
                    res.render("partials/manage/logs", logs);
                });
            }
            else
                res.render("partials/login");
        }
        Logs.get = get;
    })(Logs = Routing.Logs || (Routing.Logs = {}));
})(Routing = exports.Routing || (exports.Routing = {}));
exports.__esModule = true;
exports["default"] = Routing;
