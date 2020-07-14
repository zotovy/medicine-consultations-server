import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

// @types
import { Server } from "http";

import ApiRouter from "./routes/index";

// Config MODE to dev
// process.env.MODE = "testing";

// Config env
if (process.env.MODE === "testing") {
    // load testing config
    const result = dotenv.config({ path: "./.env.testing" });
    if (result.error) {
        console.error(result.error);
    }
} else if (process.env.MODE === "production") {
    // load production config
    const result = dotenv.config({ path: "./.env" });
    if (result.error) {
        console.error(result.error);
    }
} else {
    // load dev config
    const result = dotenv.config({ path: "./.env.dev" });
    if (result.error) {
        console.error(result.error);
    }
}
// Create app
const PORT: number = parseInt(process.env.PORT ?? "") || 5000;
const app = express();

// Apply middlewares
app.use(cors());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use("/static", express.static("static"));
app.use(bodyParser.json());
app.use("/api", ApiRouter);

// for what??
if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
}

let server: Server | undefined;

const main = async () => {
    try {
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

        // setup server listen
        server = app.listen(PORT, "localhost", () => {
            console.log(`server listening on localhost:${PORT}`);
            console.log(process.env.jwt_access);
        });
    } catch (e) {
        console.log(e);
    }
};

// run server
main();

export default app;
export { server };
