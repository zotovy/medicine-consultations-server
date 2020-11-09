import { Router as Express } from "express";
import consultation_services from "../services/consultation_services";
import token_services from "../services/token_services";
import Consultation from "../models/consultation";
import logger from "../logger";
import { IDoctor, IUser } from "../types/models";
import User from "../models/user";

const Router = Express();

Router.post("/create", async (req, res) => {
    const id = await consultation_services.create(req.body).catch((e) => e);

    const status = id === "invalid_error" ? 500 : Array.isArray(id) ? 400 : 201;
    const body =
        Array.isArray(id) || id === "invalid_error"
            ? { success: false, errors: id }
            : { success: true, id };

    return res.status(status).json(body);
});

Router.get("/:id", token_services.authenticateToken, async (req, res) => {
    const { id } = req.params;

    console.log(req.headers.userId);

    try {
        const consultation = await Consultation.findById(id)
            .select("-_id -__v")
            .populate([
                { path: "patientId", select: "fullName photoUrl _id" },
                {
                    path: "doctorId",
                    select: "fullName photoUrl _id speciality",
                },
            ])
            .lean()
            .exec();

        // If user is not a patiens and is not a doctor
        if (
            req.headers.userId != (consultation?.doctorId as IDoctor)._id &&
            req.headers.userId != (consultation?.patientId as IUser)._id
        ) {
            return res.status(412).json({
                success: false,
                error: "access_denied",
            });
        }

        return res.status(200).json({
            status: true,
            consultation,
        });
    } catch (e) {
        console.log(e);
        logger.e(`error while get consultation with id = ${id}`);
        return res.status(500).json({ success: false, error: "invalid_error" });
    }
});

Router.get("/user/:id", async (req, res) => {

    const { id } = req.params;

    const user = await User.findById(id).populate({
        path: "consultations",
        select: "doctorId date",
        populate: [
            {
                path: "doctorId",
                select: "fullName photoUrl _id speciality"

            }
        ]
    }).select("consultations").lean().exec();

    return res.status(user !== null ? 404 : 200).json({
        success: user !== null,
        consultations: user?.consultations,
        error: user === null ? "invalid_error" : undefined
    });

});

export default Router;
