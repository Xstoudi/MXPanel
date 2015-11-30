import * as express from "express";
import * as mysql from "mysql";
import * as path from "path";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as session from "express-session";

import Logger from "./Logger";
import Configuration from "./Configuration";
import Routing from "./Routing";

Configuration.loadConfiguration();

let sqlServer = mysql.createConnection({
	host:     Configuration.getSqlHost(),
	user:     Configuration.getSqlUser(),
	password: Configuration.getSqlPass(),
	database: Configuration.getSqlDatabase()
});

sqlServer.connect((err) => {
	if(Logger.err(err)){
		gracefulExit();
	}
	Logger.log(`Connected to database "${Configuration.getSqlDatabase()}" on ${Configuration.getSqlHost()}`);
	appMain();
});

function appMain(){
	let httpServer = express();
	
	httpServer.set("views", path.join(__dirname, "views"));
  	httpServer.use(express.static(path.join(__dirname, "public")));
  	httpServer.set("view engine", "jade");
  	httpServer.set('trust proxy', 1);
	  
	httpServer.use(cookieParser());
	httpServer.use(session({
		secret: "PoneyMagiqueSurRoulettesChromees",
		saveUninitialized: true,
		resave: false
	}));
	httpServer.use(bodyParser.json());
	httpServer.use(bodyParser.urlencoded({extended: true}));
	
	// Routes
	httpServer.get("/", Routing.Home.get);
	
	httpServer.get("/login", Routing.Login.get);
	httpServer.post("/login", Routing.Login.post);
	
	httpServer.post("/logout", Routing.Logout.post);
	
	httpServer.get("/overview", Routing.Overview.get);
	
	httpServer.get("/server/:server", Routing.Server.get);
	
	httpServer.post("/server/:server", Routing.Server.post);
		
	httpServer.listen(Configuration.getHttpPort(), () => {
		Logger.log(`Listen for HTTP requests on ${Configuration.getHttpPort()}`)
	});
}

function gracefulExit(){
	sqlServer.end();
	Logger.log('Database connection closed through app termination...');
	
	process.exit(0);
}
