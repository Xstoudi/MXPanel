/// <reference path="./../typings/tsd.d.ts" />

import * as fs from "fs";
import * as crypto from "crypto";
let JSONFormatter = require("simple-json-formatter");

import Logger from "./Logger";

namespace Configuration{

	let configPath = `${__dirname}/../config.json`;

	interface IConfiguration{
		sqlHost: string,
		sqlUser: string,
		sqlPass: string,
		sqlDatabase: string,
		httpPort: number,
		panelPassword: string,
		trustProxy: number,
		secretSessionKey: string,
	}

	let defaultConfig: IConfiguration = {
		sqlHost: "localhost",
		sqlUser: "root",
		sqlPass: "",
		sqlDatabase: "hermes",
		httpPort: 3000,
		panelPassword: "PoneyMagique",
		trustProxy: 2
		secretSessionKey: "PoneyMagiqueSurRoulettesChromees"
	}

	let config: IConfiguration = undefined;

	export function loadConfiguration(){
		Logger.log("Loading configuration...");
		let exists = fs.existsSync(configPath);
		if(!exists){
			Logger.log("Can't find config file, writing one...");
			writeDefault();
		}

		readConfig();
	}

	function writeDefault(){
		let writeStream = fs.createWriteStream(configPath, {encoding: "utf8"});
		writeStream.write(JSONFormatter.format(JSON.stringify(defaultConfig)), () => {
			writeStream.close();

			Logger.log("Default config file wrote, please personalize.");
			process.exit(1);
		});
	}
	function readConfig(){
		let configContent = undefined;
		try {
			configContent = fs.readFileSync(configPath, {encoding: "utf8"});
			config = configContent ? JSON.parse(configContent) : defaultConfig;
			Logger.log("Configuration loaded !")
		} catch (err) {
			Logger.err(err);
		}
	}

	// Getters
	export function getSqlHost(){
		return config.sqlHost;
	}
	export function getSqlUser(){
		return config.sqlUser;
	}
	export function getSqlPass(){
		return config.sqlPass;
	}
	export function getSqlDatabase(){
		return config.sqlDatabase;
	}
	export function getHttpPort(){
		return config.httpPort;
	}
	export function getPanelPassword(){
		return config.panelPassword;
	}
	export function getTrustProxy(){
		return config.trustProxy;
	}
	export function getSecretSessionKey(){
		return config.secretSessionKey;
	}
}
export default Configuration;
