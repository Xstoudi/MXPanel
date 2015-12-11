import * as express from "express";

import Logger from "./Logger";
import Database from "./Database";
import Configuration from "./Configuration";

import * as childProcess from "child_process";
import * as fs from "fs";

export namespace Routing{
	export namespace Home{
		export function get(req: express.Request, res: express.Response){
			res.render("index");
		}
	}
	export namespace Login{
		export function get(req: express.Request, res: express.Response){
			if((<any>req.session).logged)
				res.render("partials/manage/overview");
			else
				res.render("partials/login");
		}
		export function post(req: express.Request, res: express.Response){
			if(req.body.password === Configuration.getPanelPassword()){
				let sess: any = req.session;
				sess.logged = true;

				res.status(200).send({result: "ok"});
				Logger.log(`${req.ip} logged on panel`)
			}else{
				res.status(200).send({result: "nope"});
				Logger.log(`${req.ip} tried to log on panel`)
			}
		}
	}
	export namespace Logout{
		export function post(req: express.Request, res: express.Response){
			(<any>req.session).logged = undefined;
			res.status(200).send({result: "ok"});
		}
	}
	export namespace Overview{
		export function get(req: express.Request, res: express.Response){
			if((<any>req.session).logged)
				res.render("partials/manage/overview");
			else
				res.render("partials/login");
		}
	}
	export namespace Server{
		export function get(req: express.Request, res: express.Response){
			if((<any>req.session).logged && (req.params.server == "dovecot" || req.params.server == "postfix"))
				childProcess.exec(`service ${req.params.server} status`, (err, stdout, stderr) => {
					res.status(200).send({status: stdout.toString("utf-8").indexOf("running") != -1 && !Logger.err(err) ? "ok" : "down"});
				});
			else
				res.status(403).send({please: "go hell"});
		}

		// Post command (start, reboot, stop)
		export function post(req: express.Request, res: express.Response){
			if((<any>req.session).logged && (req.params.server == "dovecot" || req.params.server == "postfix")){
				switch (req.params.command) {
					case "start":
						childProcess.exec(`service ${req.params.server} start`, (err, stdout, stderr) => {
							res.status(200).send({state: "done"});
							Logger.log(`${req.ip} started ${req.params.server}...`);
						});
						break;
					case "reboot":
						childProcess.exec(`service ${req.params.server} restart`, (err, stdout, stderr) => {
							res.status(200).send({state: "done"});
							Logger.log(`${req.ip} rebooted ${req.params.server}...`);
						});
						break;
					case "stop":
						childProcess.exec(`service ${req.params.server} stop`, (err, stdout, stderr) => {
							res.status(200).send({state: "done"});
							Logger.log(`${req.ip} stopped ${req.params.server}...`);
						});
						break;
				}
			}else
				res.status(403).send({please: "go hell"});
		}
	}
	export namespace Users{
		export function get(req: express.Request, res: express.Response){
			if((<any>req.session).logged) {
				Database.getUsers((users) => {
					Database.getDomains((domains) => {
						res.render("partials/manage/users", {users: users, domains: domains});
					});
				});
			}else
				res.render("partials/login");
		}
		export function _delete(req: express.Request, res: express.Response){
			if((<any>req.session).logged) {
				Database.deleteUser(req.params.id, () => {
					res.status(200).send({});
					Logger.log(`${req.ip} deleted user N°${req.params.id}`);
				});

			}else
				res.render("partials/login");
		}
		export function post(req: express.Request, res: express.Response){
			if((<any>req.session).logged) {
				let username = req.body.username;
				let pass = req.body.pass;
				let passRepeat = req.body.passRepeat;
				let domain = req.body.domain;

				if(username != undefined && username != ""){
					if(pass != undefined && pass != ""){
						if(pass === passRepeat){
							if(domain != undefined && domain != ""){
								Database.createUser(domain, username, pass, (message: string) => {
									res.status(200).send({message: message});
									Logger.log(`${req.ip} created user "${username}@${domain}"`);
								})
							}else{
								res.status(200).send({message: "Please select a valid domain"})
							}
						}else{
							res.status(200).send({message: "Passwords don't match"})
						}
					}else{
						res.status(200).send({message: "Please type a valid password"})
					}
				}else{
					res.status(200).send({message: "Please type an username"})
				}
			}else
				res.render("partials/login");
		}
	}

	export namespace Logs{
		export function get(req: express.Request, res: express.Response){
			if((<any>req.session).logged){
				fs.readFile(`${__dirname}/logs.log`, (err, data) => {
					let logs = [];
					if(!Logger.err(err)){
						let lines = data.toString("utf-8").split("\n").reverse();
						for(let i = 1; i < lines.length; ++i){
							let compo = lines[i].split(" ");
							logs.push({time: (compo[0] + " " + compo[1]).replace("[", "").replace("]", ""), message: compo.slice(2, compo.length).join(" ")});
						}
					}
					res.render("partials/manage/logs", {logs: logs});
				});
			}else
				res.render("partials/login");
		}
	}

	export namespace Domains{
		export function get(req: express.Request, res: express.Response){
			if((<any>req.session).logged) {
				Database.getDomains((domains) => {
					res.render("partials/manage/domains", {domains: domains});
				});
			}else
				res.render("partials/login");
		}
		export function _delete(req: express.Request, res: express.Response){
			if((<any>req.session).logged) {
				Database.deleteDomain(req.params.id, () => {
					Logger.log(`${req.ip} deleted domain N°${req.params.id}`);
					res.status(200).send({});
				});
			}else
				res.render("partials/login");
		}
		export function post(req: express.Request, res: express.Response){
			if((<any>req.session).logged) {
				let domain = req.body.domain;
				if(domain != undefined && domain != ""){
					Database.createDomain(domain, (message: string) => {
						res.status(200).send({message: message});
						Logger.log(`${req.ip} created domain "${domain}"`);
					})
				}else
					res.status(200).send({message: "Please type a domain"})
			}else
				res.render("partials/login");
		}
	}
	export namespace Aliases{
		export function get(req: express.Request, res: express.Response){
			if((<any>req.session).logged)
				Database.getAliases((aliases) => {
					Database.getUsers((users) => {
						res.render("partials/manage/aliases", {aliases: aliases, users: users});
					});
				});
			else
				res.render("partials/login");
		}
		export function _delete(req: express.Request, res: express.Response){
			if((<any>req.session).logged) {
				Database.deleteAlias(req.params.id, () => {
					Logger.log(`${req.ip} deleted alias N°${req.params.id}`);
					res.status(200).send({});
				});
			}else
				res.render("partials/login");
		}
		export function post(req: express.Request, res: express.Response){
			if((<any>req.session).logged) {
				let alias = req.body.alias;
				let destination = req.body.destination;
				if(alias != undefined && destination != undefined){
					Database.createAlias(alias, destination, (message: string) => {
						res.status(200).send({message: message});
						Logger.log(`${req.ip} created alias "${alias}" for "${destination}" `);
					})
				}else
					res.status(200).send({message: "Please type an alias"})
			}else
				res.render("partials/login");
		}
	}
	export namespace ChangePassword{
		export function get(req: express.Request, res: express.Response){
			res.render("partials/change-password");
		}
		export function post(req: express.Request, res: express.Response){
			let email = req.body.email;
			let oldPassword = req.body.oldPassword;
			let newPassword = req.body.newPassword;
			let newPasswordConf = req.body.newPasswordConf;
			
			Database.existsUserWithPassword(email, oldPassword, (exists) => {
				if(!exists){
					console.log(exists);
					res.status(200).send({message: "Email/password invalid"});
					return;
				}
				if(newPassword !== newPasswordConf){
					res.status(200).send({message: "New passwords don't match"});
					return;
				}
				Database.setPassword(email, newPassword, (message) => {
					res.status(200).send({message: message});
				});
			});
		}
	}
}
export default Routing;
