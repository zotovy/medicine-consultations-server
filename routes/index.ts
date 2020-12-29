import express from "express";
import UserRouter from "./user_routes";
import DoctorRouter from "./doctor_routes";
import AdminRouter from "./admin_routes";
import PaymentRouter from "./payment_routes";
import ConsultationRouter from "./consultation_routes";
import AppointRouter from "./appoint_routes";

const Router = express.Router();

Router.use("/", UserRouter);
Router.use("/", DoctorRouter);
Router.use("/admin", AdminRouter);
Router.use("/", PaymentRouter);
Router.use("/consultation", ConsultationRouter);
Router.use("/appoint", AppointRouter);

export default Router;
