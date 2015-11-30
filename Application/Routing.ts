import * as express from "express";

import Logger from "./Logger";
import Configuration from "./Configuration";

import * as childProcess from "child_process";

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
						});
						break;
					case "reboot":
						childProcess.exec(`service ${req.params.server} restart`, (err, stdout, stderr) => {
							res.status(200).send({state: "done"});
						});
						break;
					case "stop":
						childProcess.exec(`service ${req.params.server} stop`, (err, stdout, stderr) => {
							res.status(200).send({state: "done"});
						});
						break;
				}
			}else
				res.status(403).send({please: "go hell"});
		}	
	}
}
export default Routing;