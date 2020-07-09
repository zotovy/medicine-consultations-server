import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

import ApiRouter from "./routes/index";

dotenv.config();

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
        app.listen(PORT, "localhost", () => {
            console.log(`server listening on localhost:${PORT}`);
        });
    } catch (e) {
        console.log(e);
    }
};

// run server
main();
