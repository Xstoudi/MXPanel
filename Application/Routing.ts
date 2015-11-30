import * as express from "express";

import Logger from "./Logger";
import Configuration from "./Configuration";

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
}
export default Routing;