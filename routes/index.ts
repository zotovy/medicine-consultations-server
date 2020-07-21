import express from "express";
import UserRouter from "./user_routes";
import DoctorRouter from "./doctor_routes";

const Router = express.Router();

Router.use("/", UserRouter);
Router.use("/", DoctorRouter);

export default Router;
