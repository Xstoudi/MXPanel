var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var expressCookieParser = require("cookie-parser");
var session = require("express-session");
var Logger_1 = require("./Logger");
var Configuration_1 = require("./Configuration");
var Routing_1 = require("./Routing");
var Database_1 = require("./Database");
Configuration_1["default"].loadConfiguration();
Database_1["default"].loadDatabaseInfo();
Database_1["default"].sqlServer.connect(function (err) {
    if (Logger_1["default"].err(err)) {
        gracefulExit();
    }
    Logger_1["default"].log("Connected to database \"" + Configuration_1["default"].getSqlDatabase() + "\" on " + Configuration_1["default"].getSqlHost());
    appMain();
});
function appMain() {
    var cookieParser = expressCookieParser("PoneyMAgiqueSurRoulettesChromees");
    var httpServer = express();
    httpServer.set("views", path.join(__dirname, "views"));
    httpServer.use(express.static(path.join(__dirname, "public")));
    httpServer.set("view engine", "jade");
    httpServer.set('trust proxy', 1);
    httpServer.use(cookieParser);
    httpServer.use(session({
        secret: "PoneyMagiqueSurRoulettesChromees",
        saveUninitialized: true,
        resave: false
    }));
    httpServer.use(bodyParser.json());
    httpServer.use(bodyParser.urlencoded({ extended: true }));
    // Routes
    httpServer.get("/", Routing_1["default"].Home.get);
    httpServer.get("/login", Routing_1["default"].Login.get);
    httpServer.post("/login", Routing_1["default"].Login.post);
    httpServer.post("/logout", Routing_1["default"].Logout.post);
    httpServer.get("/overview", Routing_1["default"].Overview.get);
    httpServer.get("/server/:server", Routing_1["default"].Server.get);
    httpServer.post("/server/:server/:command", Routing_1["default"].Server.post);
    httpServer.get("/users", Routing_1["default"].Users.get);
    httpServer.delete("/users/delete/:id", Routing_1["default"].Users._delete);
    httpServer.post("/users/create", Routing_1["default"].Users.post);
    httpServer.get("/logs", Routing_1["default"].Logs.get);
    httpServer.get("/domains", Routing_1["default"].Domains.get);
    httpServer.delete("/domains/delete/:id", Routing_1["default"].Domains._delete);
    httpServer.post("/domains/create", Routing_1["default"].Domains.post);
    // httpServer.get("/pentest", Routing.Pentest.get);
    httpServer.listen(Configuration_1["default"].getHttpPort(), function () {
        Logger_1["default"].log("Listen for HTTP requests on " + Configuration_1["default"].getHttpPort());
    });
}
function gracefulExit() {
    Database_1["default"].sqlServer.end();
    Logger_1["default"].log('Database connection closed through app termination...');
    process.exit(0);
}
