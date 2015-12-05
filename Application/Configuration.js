/// <reference path="./../typings/tsd.d.ts" />
var fs = require("fs");
var JSONFormatter = require("simple-json-formatter");
var Logger_1 = require("./Logger");
var Configuration;
(function (Configuration) {
    var configPath = __dirname + "/../config.json";
    var defaultConfig = {
        sqlHost: "localhost",
        sqlUser: "root",
        sqlPass: "",
        sqlDatabase: "hermes",
        httpPort: 3000,
        panelPassword: "PoneyMagique"
    };
    var config = undefined;
    function loadConfiguration() {
        Logger_1["default"].log("Loading configuration...");
        var exists = fs.existsSync(configPath);
        if (!exists) {
            Logger_1["default"].log("Can't find config file, writing one...");
            writeDefault();
        }
        readConfig();
    }
    Configuration.loadConfiguration = loadConfiguration;
    function writeDefault() {
        var writeStream = fs.createWriteStream(configPath, { encoding: "utf8" });
        writeStream.write(JSONFormatter.format(JSON.stringify(defaultConfig)), function () {
            writeStream.close();
            Logger_1["default"].log("Default config file wrote, please personalize.");
            process.exit(1);
        });
    }
    function readConfig() {
        var configContent = undefined;
        try {
            configContent = fs.readFileSync(configPath, { encoding: "utf8" });
            config = configContent ? JSON.parse(configContent) : defaultConfig;
            Logger_1["default"].log("Configuration loaded !");
        }
        catch (err) {
            Logger_1["default"].err(err);
        }
    }
    // Getters
    function getSqlHost() {
        return config.sqlHost;
    }
    Configuration.getSqlHost = getSqlHost;
    function getSqlUser() {
        return config.sqlUser;
    }
    Configuration.getSqlUser = getSqlUser;
    function getSqlPass() {
        return config.sqlPass;
    }
    Configuration.getSqlPass = getSqlPass;
    function getSqlDatabase() {
        return config.sqlDatabase;
    }
    Configuration.getSqlDatabase = getSqlDatabase;
    function getHttpPort() {
        return config.httpPort;
    }
    Configuration.getHttpPort = getHttpPort;
    function getPanelPassword() {
        return config.panelPassword;
    }
    Configuration.getPanelPassword = getPanelPassword;
})(Configuration || (Configuration = {}));
exports.__esModule = true;
exports["default"] = Configuration;
