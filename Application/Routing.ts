import * as express from "express";

import Logger from "./Logger";
import Configuration from "./Configuration";

export namespace Routing{
	export namespace Home{
		export function get(req: express.Request, res: express.Response){
			res.render("partials/login");
		}
	}
}
export default Routing;