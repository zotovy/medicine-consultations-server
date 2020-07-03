const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const fs = require("fs");

const ApiRouter = require("./routes/index");

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use("/static", express.static("static"));
app.use(bodyParser.json());
app.use("/api", ApiRouter);

if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
}

async function main() {
    try {
        // connect to db
        await mongoose.connect(process.env.mongodb_url, {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        });
        const db = mongoose.connection;
        console.log("successfully setup db");

        // catch errorзщ
        db.on("error", () => console.log(error));

        // Setup server
        app.listen(PORT, "localhost", () => {
            console.log(`server listening on localhost:${PORT}`);
        });
    } catch (e) {
        console.log(e);
    }
}

main();
