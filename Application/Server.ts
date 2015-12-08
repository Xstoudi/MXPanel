import * as express from "express";
import * as path from "path";
import * as bodyParser from "body-parser";
import * as expressCookieParser from "cookie-parser";
import * as session from "express-session";

import Logger from "./Logger";
import Configuration from "./Configuration";
import Routing from "./Routing";
import Database from "./Database";

Configuration.loadConfiguration();

Database.loadDatabaseInfo();

Database.sqlServer.connect((err) => {
	if(Logger.err(err)){
		gracefulExit();
	}
	Logger.log(`Connected to database "${Configuration.getSqlDatabase()}" on ${Configuration.getSqlHost()}`);
	appMain();
});

function appMain(){

	let cookieParser = expressCookieParser("PoneyMAgiqueSurRoulettesChromees");

	let httpServer = express();

	httpServer.set("views", path.join(__dirname, "views"));
  	httpServer.use(express.static(path.join(__dirname, "public")));
  	httpServer.set("view engine", "jade");
  	httpServer.set("trust proxy", Configuration.getTrustProxy());

	httpServer.use(cookieParser);
	httpServer.use(session({
		secret: Configuration.getSecretSessionKey(),
		saveUninitialized: true,
		resave: false
	}));
	//httpServer.use(bodyParser.json());
	httpServer.use(bodyParser.urlencoded({extended: true}));

	// Routes
	httpServer.get("/", Routing.Home.get);

	httpServer.get("/login", Routing.Login.get);
	httpServer.post("/login", Routing.Login.post);

	httpServer.post("/logout", Routing.Logout.post);

	httpServer.get("/overview", Routing.Overview.get);

	httpServer.get("/server/:server", Routing.Server.get);
	httpServer.post("/server/:server/:command", Routing.Server.post);

	httpServer.get("/users", Routing.Users.get);
	httpServer.delete("/users/delete/:id", Routing.Users._delete);
	httpServer.post("/users/create", Routing.Users.post);

	httpServer.get("/logs", Routing.Logs.get);

	httpServer.get("/domains", Routing.Domains.get);
	httpServer.delete("/domains/delete/:id", Routing.Domains._delete);
	httpServer.post("/domains/create", Routing.Domains.post);

	httpServer.get("/aliases", Routing.Aliases.get);
	httpServer.delete("/aliases/delete/:id", Routing.Aliases._delete);
	httpServer.post("/aliases/create", Routing.Aliases.post);
	
	httpServer.get("/change-password", Routing.ChangePassword.get)

	httpServer.listen(Configuration.getHttpPort(), () => {
		Logger.log(`Listen for HTTP requests on ${Configuration.getHttpPort()}`)
	});
}

function gracefulExit(){
	Database.sqlServer.end();
	Logger.log('Database connection closed through app termination...');

	process.exit(0);
}
