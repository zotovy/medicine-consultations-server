import express from "express";
import UserRouter from "./user_routes";
import DoctorRouter from "./doctor_routes";
import AdminRouter from "./admin_routes";
import PaymentRouter from "./payment_routes";
import ConsultationRouter from "./consultation_routes";
import SupportRouter from "./support_routes";

export default class Router {

    constructor() {
        const router = express.Router();
        router.use("/", new UserRouter().router);
        router.use("/", new DoctorRouter().router);
        router.use("/admin", AdminRouter);
        router.use("/", PaymentRouter);
        router.use("/consultation", new ConsultationRouter().router);
        router.use("/support", new SupportRouter().router);
        this.router = router;
    }

    router: express.Router;
}
