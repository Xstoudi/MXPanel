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
    /*
        Users relative
    */
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
    function deleteUserByDomainId(id, callback) {
        Database.sqlServer.query("DELETE FROM virtual_users WHERE domain_id=?", [id], function (err, rows, fields) {
            if (!Logger_1["default"].err(err)) {
                callback();
            }
        });
    }
    Database.deleteUserByDomainId = deleteUserByDomainId;
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
                var request = "INSERT INTO virtual_users (domain_id, password, email) VALUES (?, ENCRYPT(?, CONCAT('$6$', SUBSTRING(SHA(?), -16))), ?)";
                Database.sqlServer.query(request, [domainId, password, Configuration_1["default"].getSecretSessionKey(), email], function (err, rows, fields) {
                    if (!Logger_1["default"].err(err)) {
                        callback("User created");
                    }
                });
            });
        });
    }
    Database.createUser = createUser;
    function existsUserWithPassword(user, password, callback) {
        Database.sqlServer.query("SELECT email FROM virtual_users WHERE email=? AND password=ENCRYPT(?, CONCAT('$6$', SUBSTRING(SHA(?), -16)))", [user, password, Configuration_1["default"].getSecretSessionKey()], function (err, rows, fields) {
            if (!Logger_1["default"].err(err)) {
                callback(rows.length > 0);
            }
        });
    }
    Database.existsUserWithPassword = existsUserWithPassword;
    function setPassword(email, password, callback) {
        Database.sqlServer.query("UPDATE virtual_users SET password=ENCRYPT(?, CONCAT('$6$', SUBSTRING(SHA(?), -16))) WHERE email=?", [password, Configuration_1["default"].getSecretSessionKey(), email], function (err, rows, fields) {
            if (!Logger_1["default"].err(err)) {
                callback("Password replaced ! :)");
            }
        });
    }
    Database.setPassword = setPassword;
    /*
        Domains relative
    */
    function getDomain(identifier, callback) {
        console.log(identifier);
        Database.sqlServer.query("SELECT " + (typeof identifier === "string" ? "id" : "name") + " FROM virtual_domains WHERE " + (typeof identifier === "string" ? "name" : "id") + "=? LIMIT 1", [identifier], function (err, rows, fields) {
            if (!Logger_1["default"].err(err)) {
                callback(rows[0].id);
            }
            else {
                callback(undefined);
            }
        });
    }
    Database.getDomain = getDomain;
    function getDomains(callback) {
        Database.sqlServer.query("SELECT id, name FROM virtual_domains", function (err, rows, fields) {
            if (!Logger_1["default"].err(err)) {
                callback(rows);
            }
        });
    }
    Database.getDomains = getDomains;
    function deleteDomain(id, callback) {
        deleteUserByDomainId(id, function () {
            Database.sqlServer.query("DELETE FROM virtual_domains WHERE id=?", [id], function (err, rows, fields) {
                if (!Logger_1["default"].err(err)) {
                    callback();
                }
            });
        });
    }
    Database.deleteDomain = deleteDomain;
    function existsDomain(domain, callback) {
        Database.sqlServer.query("SELECT name FROM virtual_domains WHERE name=?", [domain], function (err, rows, fields) {
            if (!Logger_1["default"].err(err)) {
                callback(rows.length > 0);
            }
        });
    }
    Database.existsDomain = existsDomain;
    function createDomain(domain, callback) {
        existsDomain(domain, function (exists) {
            if (exists) {
                callback("Domain already exists");
                return;
            }
            var request = "INSERT INTO virtual_domains (name) VALUES (?)";
            Database.sqlServer.query(request, [domain], function (err, rows, fields) {
                if (!Logger_1["default"].err(err)) {
                    callback("Domain created");
                }
            });
        });
    }
    Database.createDomain = createDomain;
    /*
        Aliases relative
    */
    function getAliases(callback) {
        Database.sqlServer.query("SELECT * FROM virtual_aliases", function (err, rows, fields) {
            if (!Logger_1["default"].err(err)) {
                callback(rows);
            }
        });
    }
    Database.getAliases = getAliases;
    function deleteAlias(id, callback) {
        Database.sqlServer.query("DELETE FROM virtual_aliases WHERE id=?", [id], function (err, rows, fields) {
            if (!Logger_1["default"].err(err)) {
                callback();
            }
        });
    }
    Database.deleteAlias = deleteAlias;
    function createAlias(alias, destination, callback) {
        Database.existsAlias(alias, destination, function (existsAlias) {
            if (existsAlias) {
                callback("Alias already exists...");
                return;
            }
            var domain = alias.split("@")[1];
            Database.getDomain(domain, function (identifier) {
                Database.sqlServer.query("INSERT INTO virtual_aliases (domain_id, source, destination) VALUES (?,?,?)", [identifier, alias, destination], function (err, rows, fields) {
                    if (!Logger_1["default"].err(err)) {
                        callback("Alias created");
                    }
                });
            });
        });
    }
    Database.createAlias = createAlias;
    function existsAlias(alias, destination, callback) {
        Database.sqlServer.query("SELECT id FROM virtual_aliases WHERE source=? AND destination=?", [alias, destination], function (err, rows, fields) {
            if (!Logger_1["default"].err(err)) {
                callback(rows.length > 0);
            }
        });
    }
    Database.existsAlias = existsAlias;
})(Database = exports.Database || (exports.Database = {}));
exports.__esModule = true;
exports["default"] = Database;
