import setupModels from "./models";
import fs from "fs";
import express, { Express } from "express";
import mongoose from "mongoose";
import socketio from "socket.io";
import logger from "./logger";
import https from "https";
import cors from "cors";
import bodyParser from "body-parser";
import ApiRouter from "./routes";
import * as Sentry from "@sentry/node";

class Server {
    app: Express;
    port: number;
    url: string;
    db: mongoose.Connection;
    server: https.Server;
    io: SocketIO.Server;
    useSentry: boolean = false;

    constructor({ useSentry = false } = {}) {
        this.app = express();
        this.port = parseInt(process.env.PORT ?? "") || 5000;
        this.url = process.env.url ?? "";
        this.db = mongoose.connection;
        this.server = https.createServer({});
        this.io = socketio();
        this.useSentry = useSentry;
    }

    setupDatabase = async (): Promise<void> => {
        await mongoose
            .connect(process.env.mongodb_url ?? "", {
                useNewUrlParser: true,
                useFindAndModify: false,
                useUnifiedTopology: true,
            })
            .catch((e) => logger.e(e));
        this.db = mongoose.connection;
        this.db.on("error", (e) => logger.e(e));
        logger.i("successfully connected to database");
    };

    setupExpress = async (): Promise<void> => {
        if (this.useSentry && process.env.MODE === "production") {
            Sentry.init({ dsn: process.env.sentryDns });
            this.app.use(Sentry.Handlers.requestHandler());
        }

        this.app.use(cors());
        this.app.use(
            bodyParser.urlencoded({
                extended: true,
            })
        );
        this.app.use(bodyParser.json());
        this.app.use("/static", express.static("static"));
        this.app.use("/api", ApiRouter);

        if (this.useSentry && process.env.MODE === "production") {
            this.app.use(Sentry.Handlers.errorHandler());
        }
    };

    public get setupModels() {
        return setupModels;
    }

    setupServer = async (): Promise<void> => {
        const httpsOptions = {
            key: fs.readFileSync(process.env.ssl_key_path ?? "").toString(),
            cert: fs.readFileSync(process.env.ssl_cert_path ?? "").toString(),
        };

        this.server = https
            .createServer(httpsOptions, this.app)
            .listen(this.port, this.url, () => {
                console.log(
                    `server listening on https://${this.url}:${this.port}`
                );
            });
    };

    setupSocketIO = async (): Promise<void> => {
        this.io = socketio(this.server, {
            transports: ["websocket"],
        });
    };
}

export default new Server();
