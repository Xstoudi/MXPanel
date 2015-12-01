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
    function deleteUser(id, callback) {
        Database.sqlServer.query("DELETE FROM virtual_users WHERE id=?", [id], function (err, rows, fields) {
            if (!Logger_1["default"].err(err)) {
                callback();
            }
        });
    }
    Database.deleteUser = deleteUser;
    function existsUser(user, callback) {
        Database.sqlServer.query("SELECT email FROM virtual_users WHERE email=?", [user], function (err, rows, fields) {
            if (!Logger_1["default"].err(err)) {
                callback(rows.length > 0);
            }
        });
    }
    Database.existsUser = existsUser;
    function createUser(domain, user, password, callback) {
        getDomain(domain, function (domainId) {
            if (domainId == undefined) {
                callback("Domain doesn't exist");
                return;
            }
            existsUser(user, function (exists) {
                if (exists) {
                    callback("User already exists");
                    return;
                }
                var email = user + "@" + domain;
                var request = "INSERT INTO virtual_users (domain_id, password, email) VALUES (?, ENCRYPT(?, CONCAT('$6$', SUBSTRING(SHA(RAND()), -16))), ?)";
                Database.sqlServer.query(request, [domainId, password, email], function (err, rows, fields) {
                    if (!Logger_1["default"].err(err)) {
                        callback("User created");
                    }
                });
            });
        });
        /*
        
        INSERT INTO `mailserver`.`virtual_users`
  (`id`, `domain_id`, `password` , `email`)
VALUES
  ('1', '1', ENCRYPT('password', CONCAT('$6$', SUBSTRING(SHA(RAND()), -16))), 'email1@example.com'),
  ('2', '1', ENCRYPT('password', CONCAT('$6$', SUBSTRING(SHA(RAND()), -16))), 'email2@example.com');*/
    }
    Database.createUser = createUser;
    function getDomain(identifier, callback) {
        Database.sqlServer.query("SELECT " + (typeof identifier === "string" ? "id" : "name") + " FROM virtual_domains WHERE " + (typeof identifier === "string" ? "name" : "id") + "=? LIMIT 1", [identifier], function (err, rows, fields) {
            if (!Logger_1["default"].err(err)) {
                callback(rows[0]);
            }
            else {
                callback(undefined);
            }
        });
    }
    Database.getDomain = getDomain;
})(Database = exports.Database || (exports.Database = {}));
exports.__esModule = true;
exports["default"] = Database;
