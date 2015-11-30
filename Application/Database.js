var Logger_1 = require("./Logger");
var Configuration_1 = require("./Configuration");
var mysql = require("mysql");
var Database;
(function (Database) {
    Database.sqlServer = undefined;
    function loadDatabaseInfo() {
        Database.sqlServer = mysql.createConnection({
            host: Configuration_1["default"].getSqlHost(),
            user: Configuration_1["default"].getSqlUser(),
            password: Configuration_1["default"].getSqlPass(),
            database: Configuration_1["default"].getSqlDatabase()
        });
    }
    Database.loadDatabaseInfo = loadDatabaseInfo;
    function getUsers(callback) {
        Database.sqlServer.query("SELECT id, email FROM virtual_users", function (err, rows, fields) {
            if (!Logger_1["default"].err(err)) {
                callback(rows);
            }
        });
    }
    Database.getUsers = getUsers;
})(Database = exports.Database || (exports.Database = {}));
exports.__esModule = true;
exports["default"] = Database;
