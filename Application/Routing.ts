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
			console.log((<any>req.session).logged);
			if((<any>req.session).logged) 
				res.render("partials/manage/overview");	
			else
				res.render("partials/login");
		}
	}
	export namespace Server{
		export namespace Postfix{
			// Get postfix status
			export function get(req: express.Request, res: express.Response){
				if((<any>req.session).logged)
					childProcess.exec("service postfix status", (err, stdout, stderr) => {
						res.status(200).send({status: stdout.toString("utf-8").indexOf("running") != -1 && !Logger.err(err) ? "ok" : "down"});
					});
				else
					res.status(403).send({please: "go hell"});
			}
			
			// Post postfix command (start, reboot, stop)
			export function post(req: express.Request, res: express.Response){
				
			}	
		}
		export namespace Dovecot{
			// Get dovecot status
			export function get(req: express.Request, res: express.Response){
				if((<any>req.session).logged)
					childProcess.exec("service dovecot status", (err, stdout, stderr) => {
						res.status(200).send({status: stdout.toString("utf-8").indexOf("running") != -1 && !Logger.err(err) ? "ok" : "down"});
					});
				else
					res.status(403).send({please: "go hell"});
			}
			
			// Post dovecot command (start, reboot, stop)
			export function post(req: express.Request, res: express.Response){
			}	
		}
	}
}
export default Routing;