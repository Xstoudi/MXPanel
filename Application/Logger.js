var fs = require("fs");
var Color = require("ansicolors");
var Logger;
(function (Logger) {
    var logPath = __dirname + "/logs.log";
    function log() {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i - 0] = arguments[_i];
        }
        var date = new Date();
        var dateFormatted = formatTwoDigit(date.getDate()) + "." + formatTwoDigit(date.getMonth() + 1) + "." + formatTwoDigit(date.getFullYear()) + " " + formatTwoDigit(date.getHours()) + ":" + formatTwoDigit(date.getMinutes()) + ":" + formatTwoDigit(date.getSeconds());
        console.log(Color.brightBlue("[" + dateFormatted + "] ") + Array.prototype.slice.call(arguments));
        fs.appendFile(logPath, "[" + dateFormatted + "] " + Array.prototype.slice.call(arguments) + "\n");
    }
    Logger.log = log;
    function err(err) {
        if (err) {
            log(err);
            return true;
        }
        return false;
    }
    Logger.err = err;
    function formatTwoDigit(n) {
        return (n < 10 ? "0" : "") + n;
    }
})(Logger = exports.Logger || (exports.Logger = {}));
exports.__esModule = true;
exports["default"] = Logger;
