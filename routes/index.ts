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
        router.use("/", UserRouter.getRouter());
        router.use("/", DoctorRouter);
        router.use("/admin", AdminRouter);
        router.use("/", PaymentRouter);
        router.use("/consultation", ConsultationRouter.getRouter());
        router.use("/support", SupportRouter.getRouter());
        this.router = router;
    }

    router: express.Router;
}
