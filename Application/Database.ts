import Logger from "./Logger";
import Configuration from "./Configuration";

import * as mysql from "mysql";

export namespace Database{
	export let sqlServer: mysql.IConnection = undefined;

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
	
	export function deleteUser(id: number, callback: () => void){
		sqlServer.query("DELETE FROM virtual_users WHERE id=?", [id], (err, rows, fields) => {
			if(!Logger.err(err)){
				callback();
			}
		});
	}
	
	export function existsUser(user: string, callback: (exists: boolean) => void){
		sqlServer.query(`SELECT email FROM virtual_users WHERE email=?`, [user], (err, rows, fields) => {
			if(!Logger.err(err)){
				callback(rows.length > 0);
			}
		});
	}
	
	export function createUser(domain: string, user: string, password: string, callback: (result) => void){
		getDomain(domain, (domainId) => {
			if(domainId == undefined){
				callback("Domain doesn't exist")
				return;
			}
				
			existsUser(user, (exists) => {
				if(exists){
					callback("User already exists");
					return;
				}
				let email = `${user}@${domain}`;
				let request = "INSERT INTO virtual_users (domain_id, password, email) VALUES (?, ENCRYPT(?, CONCAT('$6$', SUBSTRING(SHA(RAND()), -16))), ?)";
				sqlServer.query(request, [domainId, password, email], (err, rows, fields) => {
					if(!Logger.err(err)){
						callback("User created");
					}
				});
			});
		});
	}
	
	export function getDomain(identifier: string | number, callback: (identifier: string | number) => void){
		sqlServer.query("SELECT " + (typeof identifier === "string" ? "id" : "name") + " FROM virtual_domains WHERE " + (typeof identifier === "string" ? "name" : "id") + "=? LIMIT 1", [identifier], (err, rows, fields) => {
			if(!Logger.err(err)){
				callback(rows[0]);
			}else{
				callback(undefined);
			}
		});
	}
}
export default Database;