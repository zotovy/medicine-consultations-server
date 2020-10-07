import dotenv from "dotenv";

// Config env
if (process.env.MODE === "testing") {
    console.log("server running in testing mode");

    // load testing config
    const result = dotenv.config({ path: "./configs/.env.testing" });
    if (result.error) {
        console.error(result.error);
    }
} else if (process.env.MODE === "production") {
    // load production config
    const result = dotenv.config({ path: "./configs/.env" });
    if (result.error) {
        console.error(result.error);
    }
} else if (process.env.MODE === "dev") {
    console.log("server running in development mode");

    // load dev config
    const result = dotenv.config({ path: "./configs/.env.dev" });
    if (result.error) {
        console.error(result.error);
    }
} else if (process.env.MODE === "fake") {
    console.log("server running in fake mode");
    // load fake config
    const result = dotenv.config({ path: "./configs/fake.env" });
    if (result.error) {
        console.error(result.error);
    }
}

import setupModels from "./models";
import fs from "fs";
import express from "express";
import mongoose from "mongoose";
import * as Sentry from "@sentry/node";
import bodyParser from "body-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import socketio from "socket.io";
import { PeerServer } from "peer";
import https from "https";
import SocketServices from "./services/socket_services";

import ApiRouter from "./routes/index";
import FakeRouter from "./routes/fake_api_routes";

// email_services.sendResetPasswordMail("the1i");

// Limit request from one IP per hour
const appLimitter = rateLimit({
    windowMs: 1000,
    max: 100, // Not more than 100 request in 10 seconds
});

// HTTPS optiosn
const httpsOptions = {
    key: fs.readFileSync("./security/cert.key").toString(),
    cert: fs.readFileSync("./security/cert.pem").toString(),
};

// Create app
const PORT: number = parseInt(process.env.PORT ?? "") || 5000;
const app = express();

// Config sentry
if (process.env.MODE === "production") {
    Sentry.init({
        dsn:
            "https://65f48faa380a4894a949c0819a27c068@o433163.ingest.sentry.io/5389090",
    });
    app.use(Sentry.Handlers.requestHandler());
}

// Apply middlewares
app.use(appLimitter);
app.use(cors());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use("/static", express.static("static"));
app.use(bodyParser.json());
app.use("/api", ApiRouter);

// todo
app.get("/reset-password/:id", (req, res) => {
    return res.send(`<h1>your id is ${req.params.id}</h1>`);
});
app.get("/unsubscribe-from-password/:id", (req, res) => {
    return res.send(`<h1>your id is ${req.params.id}</h1>`);
});

if (process.env.MODE === "production") {
    app.use(Sentry.Handlers.errorHandler());
}

if (process.env.MODE === "fake") {
    // load fake api
    app.use("/fake", FakeRouter);
}

// for what??
if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
}

setupModels();

const main = async () => {
    if (process.env.MODE === "testing") return;

    try {
        console.log(process.env.mongodb_url);

        // connect to db
        await mongoose.connect(process.env.mongodb_url ?? "", {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        });
        const db = mongoose.connection;
        console.log("successfully connect to db");

        // catch error
        db.on("error", (error: Error) => console.log(error));

        // io.listen(server);
    } catch (e) {
        console.log(e);
    }
};

// run server
main();

// Listen server & setup socket.io
const server = https
    .createServer(httpsOptions, app)
    .listen(PORT, "0.0.0.0", () =>
        console.log(`server listening on https://localhost:${PORT}`)
    );
const io = socketio(server, {
    transports: ["websocket"],
});

export default app;
export { server, io };

new SocketServices();
