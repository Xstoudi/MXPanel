var express = require("express");
var mysql = require("mysql");
var path = require("path");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var Logger_1 = require("./Logger");
var Configuration_1 = require("./Configuration");
Configuration_1["default"].loadConfiguration();
var sqlServer = mysql.createConnection({
    host: Configuration_1["default"].getSqlHost(),
    user: Configuration_1["default"].getSqlUser(),
    password: Configuration_1["default"].getSqlPass(),
    database: Configuration_1["default"].getSqlDatabase()
});
sqlServer.connect(function (err) {
    if (Logger_1["default"].err(err)) {
        gracefulExit();
    }
    Logger_1["default"].log("Connected to database \"" + Configuration_1["default"].getSqlDatabase() + "\" on " + Configuration_1["default"].getSqlHost());
    appMain();
});
function appMain() {
    var httpServer = express();
    httpServer.set("views", path.join(__dirname, "views"));
    httpServer.use(express.static(path.join(__dirname, "public")));
    httpServer.set("view engine", "jade");
    httpServer.set('trust proxy', 1);
    httpServer.use(cookieParser());
    httpServer.use(session({
        secret: "PoneyMagiqueSurRoulettesChromees",
        saveUninitialized: true,
        resave: false
    }));
    httpServer.use(bodyParser.json());
    httpServer.use(bodyParser.urlencoded({ extended: true }));
    // Routes
}
function gracefulExit() {
    sqlServer.end();
    Logger_1["default"].log('Database connection closed through app termination...');
    process.exit(0);
}
