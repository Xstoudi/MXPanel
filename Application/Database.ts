import Logger from "./Logger";
import Configuration from "./Configuration";

import * as mysql from "mysql";

export namespace Database{
	export let sqlServer = undefined;

	export function loadDatabaseInfo(){
		sqlServer = mysql.createConnection({
			host:     Configuration.getSqlHost(),
			user:     Configuration.getSqlUser(),
			password: Configuration.getSqlPass(),
			database: Configuration.getSqlDatabase()
		});
	}

	export function getUsers(callback: (users) => void){
		sqlServer.query("SELECT id, email FROM virtual_users", (err, rows, fields) => {
			if(!Logger.err(err)){
				callback(rows);
			}
		});
	}
}
export default Database;