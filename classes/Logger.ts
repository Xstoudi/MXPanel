import * as fs from "fs";
let Color = require("ansicolors");

export module Logger{
	
	let logPath = `${__dirname}/../logs.log`;
	
	export function log(...params: any[]){
		let date = new Date();
		let dateFormatted = `${formatTwoDigit(date.getDate())}.${formatTwoDigit(date.getMonth()+1)}.${formatTwoDigit(date.getFullYear())} ${formatTwoDigit(date.getHours())}:${formatTwoDigit(date.getMinutes())}:${formatTwoDigit(date.getSeconds())}`;
		console.log(Color.brightBlue(`[${dateFormatted}] `) + Array.prototype.slice.call(arguments));
		
		fs.appendFile(logPath, `[${dateFormatted}] ${Array.prototype.slice.call(arguments)}\n`);
	}
	
	export function err(err: Error): boolean{
		if(err){
			log(err);
			return true;
		}
		return false;
	}
	
	function formatTwoDigit(n: number): string{
		return (n < 10 ? "0" : "") + n;	
	}
}
export default Logger;