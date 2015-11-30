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
			res.render("partials/login");
		}
		export function post(req: express.Request, res: express.Response){
			if(req.body.password === Configuration.getPanelPassword()){
				res.status(200).send({result: "ok"});
			}else{
				res.status(200).send({result: "nope"});
			}
		}
	}
	export namespace Overview{
		export function get(req: express.Request, res: express.Response){
			res.render("partials/manage/overview");	
		}
	}
	export namespace Server{
		export namespace Postfix{
			// Get postfix status
			export function get(req: express.Request, res: express.Response){
				childProcess.exec("service postfix status", (err, stdout, stderr) => {
					res.status(200).send({status: stdout.toString("utf-8").indexOf("running") != -1 && !Logger.err(err) ? "ok" : "down"});
				});
			}
			
			// Post postfix command (start, reboot, stop)
			export function post(req: express.Request, res: express.Response){
			}	
		}
		export namespace Dovecot{
			// Get dovecot status
			export function get(req: express.Request, res: express.Response){
				childProcess.exec("service dovecot status", (err, stdout, stderr) => {
					res.status(200).send({status: stdout.toString("utf-8").indexOf("running") != -1 && !Logger.err(err) ? "ok" : "down"});
				});
			}
			
			// Post dovecot command (start, reboot, stop)
			export function post(req: express.Request, res: express.Response){
				
			}
		}
	}
}
export default Routing;