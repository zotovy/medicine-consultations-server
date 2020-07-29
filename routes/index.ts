import express from "express";
import UserRouter from "./user_routes";
import DoctorRouter from "./doctor_routes";
import AdminRouter from "./admin_routes";

const Router = express.Router();

Router.use("/", UserRouter);
Router.use("/", DoctorRouter);
Router.use("/admin", AdminRouter);

export default Router;
