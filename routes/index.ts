import express from "express";
import UserRouter from "./user_routes";

const Router = express.Router();

Router.use("/", UserRouter);

export default Router;
