///<reference path="./node_modules/@types/node/index.d.ts"/>

import fs from "fs";
import path from "path";
import colors from "colors";

class Logger {
    startDate: Date;
    stack: Log[] = [];
    maxLogsInStack = 25;
    filesPath: string = "./logs";

    constructor() {
        this.startDate = new Date();
    }

    saveStack = async () => {
        const stackAsString: string = JSON.stringify(this.stack);
        const filePath =
            this.filesPath +
            "/" +
            new Date().toLocaleString().replace(" ", "-").split(":").join("") +
            ".json";

        fs.writeFile(path.resolve(__dirname, filePath), stackAsString, (e) => {
            if (e) {
                console.log(e);
            }
        });
    };

    saveToStack = (log: Log) => {
        if (this.stack.length >= this.maxLogsInStack) {
            this.stack.shift();
        }
        this.stack.push(log);
    };

    error = (message: any, ...args: any[]): void => {
        const time = new Date();

        console.log(`${colors.bgRed.white(" Error: ")} ${message}`, ...args);
        console.log(`${new Date().toISOString()}`);

        const log: Log = {
            type: LogType.Error,
            message: message.toString(),
            timestamp: time,
        };

        this.saveToStack(log);
        this.saveStack();
    };

    warning = (message: any, ...args: any[]): void => {
        const time = new Date();

        console.log(`${" Warning: ".black.bgYellow} ${message}`, ...args);
        console.log(`${new Date().toISOString()}`);

        const log: Log = {
            type: LogType.Warning,
            message: message,
            timestamp: time,
        };

        this.saveToStack(log);
    };

    info = (message: string, ...args: any[]): void => {
        const time = new Date();

        console.log(`${"logger:".italic} ${message}`, ...args);

        const log: Log = {
            type: LogType.Warning,
            message: message,
            timestamp: time,
        };

        this.saveToStack(log);
    };

    clear = async () => {
        fs.readdir(this.filesPath, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join(this.filesPath, file), (err) => {
                    if (err) throw err;
                });
            }
        });
    };

    // shortcuts
    e = this.error;
    w = this.warning;
    i = this.info;
}

type Log = {
    type: LogType;
    message: string;
    trace?: any;
    timestamp: Date;
};

enum LogType {
    Error = "error",
    Warning = "warning",
    Info = "info",
}

export default new Logger();
