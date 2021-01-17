import { IRoute, Router as ExpressRouter } from "express";
import consultationServices from "../services/consultation_services";
import tokenServices from "../services/token_services";
import Consultation from "../models/consultation";
import logger from "../logger";
import { IDoctor, IUser } from "../types/models";
import User from "../models/user";
import Doctor from "../models/doctor";
import IRouteHandler, { BaseRouter } from "../types/routes";

export default class ConsultationRoutes implements BaseRouter {

    router: ExpressRouter;

    constructor() {
        const Router = ExpressRouter();
        Router.post("/create", ConsultationRoutes.createConsultation);
        Router.get("/:id", tokenServices.authenticateToken, ConsultationRoutes.getById);
        Router.get("/user/:id", tokenServices.authenticateToken, ConsultationRoutes.getUserConsultations);
        this.router = Router;
    }

    private static createConsultation: IRouteHandler = async (req, res) => {
        const id = await consultationServices.create(req.body).catch((e) => e);

        const status = id === "invalid_error" ? 500 : Array.isArray(id) ? 400 : 201;
        const body =
            Array.isArray(id) || id === "invalid_error"
                ? { success: false, errors: id }
                : { success: true, id };

        return res.status(status).json(body);
    }

    private static getById: IRouteHandler = async (req, res) => {
        const { id } = req.params;

        try {
            const consultation = await Consultation.findById(id)
                .select("-_id -__v")
                .populate([
                    { path: "patient", select: "fullName photoUrl _id" },
                    {
                        path: "doctor",
                        select: "fullName photoUrl _id speciality",
                    },
                ])
                .lean()
                .exec();

            // If user is not a patient and is not a doctor
            if (
                req.headers.userId != (consultation?.doctor as IDoctor)?._id &&
                req.headers.userId != (consultation?.patient as IUser)?._id
            ) {
                return res.status(403).json({
                    success: false,
                    error: "access_denied",
                });
            }

            return res.status(200).json({
                success: true,
                consultation,
            });
        } catch (e) {
            console.log(e);
            logger.e(`error while get consultation with id = ${id}`);
            return res.status(500).json({ success: false, error: "invalid_error" });
        }
    }

    private static getUserConsultations: IRouteHandler = async (req, res) => {
        const { id } = req.params;
        let { isUser } = req.query;

        if (!isUser) isUser = "true";

        const populate = {
            path: "consultations",
            select: "doctorId date note",
            populate: [
                {
                    path: "doctorId",
                    select: "fullName photoUrl _id speciality"

                }
            ]
        };

        const user = isUser === "true"
            ? await User.findById(id).populate(populate).select("consultations").lean().exec()
            : await Doctor.findById(id).populate(populate).select("consultations").lean().exec()

        return res.status(user === null ? 404 : 200).json({
            success: user !== null,
            consultations: user?.consultations,
            error: user === null ? "invalid_error" : undefined
        });
    }

}

