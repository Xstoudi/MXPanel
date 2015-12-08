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

	/*
		Users relative
	*/
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

	export function deleteUserByDomainId(id: number, callback: () => void){
		sqlServer.query("DELETE FROM virtual_users WHERE domain_id=?", [id], (err, rows, fields) => {
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

	/*
		Domains relative
	*/
	export function getDomain(identifier: string | number, callback: (identifier: string | number) => void){
		console.log(identifier);
		sqlServer.query("SELECT " + (typeof identifier === "string" ? "id" : "name") + " FROM virtual_domains WHERE " + (typeof identifier === "string" ? "name" : "id") + "=? LIMIT 1", [identifier], (err, rows, fields) => {
			if(!Logger.err(err)){
				callback(rows[0].id);
			}else{
				callback(undefined);
			}
		});
	}
	export function getDomains(callback: (domains) => void){
		sqlServer.query("SELECT id, name FROM virtual_domains", (err, rows, fields) => {
			if(!Logger.err(err)){
				callback(rows);
			}
		});
	}
	export function deleteDomain(id: number, callback: () => void){
		deleteUserByDomainId(id, () => {
			sqlServer.query("DELETE FROM virtual_domains WHERE id=?", [id], (err, rows, fields) => {
				if(!Logger.err(err)){
					callback();
				}
			});
		});
	}
	export function existsDomain(domain: string, callback: (exists: boolean) => void){
		sqlServer.query("SELECT name FROM virtual_domains WHERE name=?", [domain], (err, rows, fields) => {
			if(!Logger.err(err)){
				callback(rows.length > 0);
			}
		});
	}
	export function createDomain(domain: string, callback: (result) => void){
		existsDomain(domain, (exists) => {
			if(exists){
				callback("Domain already exists");
				return;
			}
			let request = "INSERT INTO virtual_domains (name) VALUES (?)";
			sqlServer.query(request, [domain], (err, rows, fields) => {
				if(!Logger.err(err)){
					callback("Domain created");
				}
			});
		});
	}
	
	/*
		Aliases relative
	*/
	export function getAliases(callback: (aliases) => void){
		sqlServer.query("SELECT * FROM virtual_aliases", (err, rows, fields) => {
			if(!Logger.err(err)){
				callback(rows);
			}
		})
	}
	export function deleteAlias(id: number, callback: () => void){
		sqlServer.query("DELETE FROM virtual_aliases WHERE id=?", [id], (err, rows, fields) => {
			if(!Logger.err(err)){
				callback();
			}
		});
	}
	export function createAlias(alias: string, destination: string, callback: (message: string) => void){
		Database.existsAlias(alias, destination, (existsAlias) => {
			if(existsAlias){
				callback("Alias already exists...");
				return;
			}
			let domain = alias.split("@")[1];
			Database.getDomain(domain, (identifier) => {
				sqlServer.query("INSERT INTO virtual_aliases (domain_id, source, destination) VALUES (?,?,?)", [identifier, alias, destination], (err, rows, fields) => {
					if(!Logger.err(err)){
						callback("Alias created");
					}
				});
			});
		});	
	});
	export function existsAlias(alias: string, destination: string, callback: (exists: boolean) => void){
		sqlServer.query("SELECT id FROM virtual_aliases WHERE source=? AND destination=?", [alias, destination], (err, rows, fields) => {
			if(!Logger.err(err)){
				callback(rows.length > 0);
			}
		});
	}
}
export default Database;
