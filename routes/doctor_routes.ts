import express from "express";
import Joi from "joi";
import doctorServices from "../services/doctor_services";
import { Types } from "mongoose";
import logger from "../logger";
import { ServerError } from "../types/errors";
import encoder from "./encoder";
import symptoms, { BodyParts, BodyPartsToSpecialities } from "../types/sympthoms";
import { DoctorObject, DoctorWorkingType } from "../types/models";
import { TGetAppointsServiceOptions, translateSpeciality } from "../types/services";
import token_services from "../services/token_services";
import Ajv from "ajv";
import IRouteHandler from "../types/routes";
import ValidationHelper from "../helpers/validation_helper";


// Used to process the http request
const Router = express.Router();

class DoctorRoutes {
    public static createDoctor: IRouteHandler = async (req, res) => {
        const doctor = doctorServices.convertDoctorFields(req.body);

        const response = await doctorServices.create(doctor);

        if (response.success) {
            return res.status(201).json({
                success: true,
                uid: response.doctor?.id,
            });
        }

        return res.status(400).json({
            success: false,
            error: response.error,
            message: response.message,
            validationErrors: response.errors,
        });
    }

    public static updateDoctor: IRouteHandler = async (req, res) => {
        const doctor = doctorServices.convertDoctorFields(req.body);

        const oldDoctor = await doctorServices.getOne(doctor.id);
        const newDoctor = { ...oldDoctor, ...doctor };

        const response = await doctorServices.update(newDoctor);

        if (response.success) {
            return res.status(202).json({
                success: true,
                doctor: response.doctor,
            });
        }

        return res.status(400).json({
            success: false,
            error: response.error,
            message: response.message,
            validationErrors: response.validationErrors,
        });
    }

    public static deleteDoctor: IRouteHandler = async (req, res) => {
        const id = req.params.id;

        if (!id || !Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: "invalid_id_error",
                message: `Invalid id were provide, id=${id}`,
            });
        }

        const response = await doctorServices.delete(id);

        if (response.success) {
            return res.status(203).json({
                success: true,
                doctor: response.doctor,
            });
        } else {
            return res.status(400).json({
                success: false,
                error: response.error,
                message: response.message,
            });
        }
    }

    public static getDoctorById: IRouteHandler = async (req, res) => {
        let { id } = req.params;

        if (!id || !Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: "invalid_id_error",
                message: `Invalid id were provide, id=${id}`,
            });
        }

        const response = await doctorServices.getOne(id);

        if (response.success) {
            return res.status(200).json({
                success: true,
                doctor: response.doctor,
            });
        } else {
            return res.status(400).json({
                success: false,
                error: response.error,
                message: response.message,
            });
        }
    }

    public static getDoctors: IRouteHandler = async (req, res) => {
        const qKeys = [
            "from",
            "amount",
            "fullName",
            "city",
            "isDownward",
            "speciality",
            "qualification",
            "isChild",
            "isAdult",
            "experience",
            "workPlan",
            "rating",
            "bodyPart",
            "sortBy"
        ];

        const data = encoder.query(req.query, qKeys);
        if (data.symptoms) {
            data.bodyParts = data.symptoms;
        }

        if (data.bodyPart) {
            data.speciality = [];
            (data.bodyPart as string[]).forEach(e => {
                // @ts-ignore
                data.speciality = data.speciality.concat(BodyPartsToSpecialities[e]);
            })
        }

        if (typeof data.from !== "number") {
            data.from = undefined;
        }
        if (typeof data.amount !== "number") {
            data.amount = undefined;
        }

        try {
            let doctors = await doctorServices.getAll(
                data,
                data.from,
                data.amount
            );

            doctors.forEach((e, i) => {
                const sp: any = [];
                doctors[i].speciality.forEach(el => {
                    // @ts-ignore
                    return sp.push(translateSpeciality[el]);
                });
                doctors[i].speciality = sp;
            })

            if (req.query.type === "tile") {
                // @ts-ignore
                doctors = doctors.map((e: DoctorObject) => ({
                    name: e.name,
                    photoUrl: e.photoUrl,
                    rating: e.rating,
                    speciality: e.speciality,
                    surname: e.surname,
                    age: e.age,
                    id: e.id,
                }));
            }

            return res.status(200).json({
                success: true,
                doctors,
            });
        } catch (e) {
            logger.e(e);
            throw new ServerError(e);
        }
    }

    public static sendDoctorRequests: IRouteHandler = async (req, res) => {
        const request = req.body;

        if (!request) {
            return res.status(400).json({
                success: false,
                error: "no_body_found",
                message: "Invalid  ",
            });
        }
        const response = await doctorServices.saveBecomeDoctorRequest(request);

        if (response.success) {
            return res.status(201).json({
                success: true,
            });
        } else {
            return res.status(400).json({
                success: false,
                error: response.error,
                message: response.message,
            });
        }
    }

    public static getSymptoms: IRouteHandler = async (req, res) => {
        const { bodyPart } = req.query;

        try {
            if (BodyParts.includes(bodyPart as string)) {
                return res.status(200).json({
                    success: true,
                    // @ts-ignore
                    symptoms: symptoms[bodyPart],
                });
            } else {
                return res.status(400).json({
                    success: false,
                    error: "invalid_body_part",
                });
            }
        } catch (e) {
            return res.status(500).json({
                success: false,
                error: "invalid_error",
            });
        }
    }

    public static updateLinks: IRouteHandler = async (req, res) => {
        const updateLinksAjv = new Ajv();
        const updateLinksSchema = {
            type: "object",
            properties: {
                vk: { type: "string", maxLength: 256 },
                instagram: { type: "string", maxLength: 256 },
                telegram: { type: "string", maxLength: 256 },
                whatsApp: { type: "string", maxLength: 256 },
                viber: { type: "string", maxLength: 256 },
                email: { type: "string", maxLength: 256 },
            },
        };
        const updateLinksValidate = updateLinksAjv.compile(updateLinksSchema);

        const { id } = req.params;

        // validate id & body
        if ((id.length != 24 && id.length != 12) || id !== req.headers.userId) return res.status(400).json({
            status: false, error: "invalid_id"
        });

        if (!updateLinksValidate(req.body)) return res.status(400).json({
            status: false, error: "invalid_body"
        });

        // Update links
        const response = await doctorServices.updateLinks(id, req.body)
            .catch(e => ({ success: false, error: e }))
            .then(() => ({ success: true }));

        return res.status(response.success ? 202 : 500).json(response);
    }

    public static getAppoints: IRouteHandler = async (req, res) => {
        const { id } = req.params;

        // validate id & body
        if ((id.length != 24 && id.length != 12) || id !== req.headers.userId) return res.status(403).json({
            status: false, error: "invalid_id"
        });

        // handle query params
        const validQueriesParams: (keyof TGetAppointsServiceOptions)[] = ["numericDate"];
        const options: TGetAppointsServiceOptions = {};
        validQueriesParams.forEach(e => {
            if (req.query[e]) options[e] = req.query[e] as string;
        });


        const response = await doctorServices.getAppoints(id, options)
            .then(v => ({ success: true, appoints: v }))
            .catch(e => {
                logger.e("doctorRoutes.getAppoints: ", e);
                return ({ success: true, error: e });
            });

        return res.status(response.success ? 200 : 500).json(response);
    }

    public static getAppointsRequests: IRouteHandler = async (req, res) => {
        const { id } = req.params;
        const detail = req.query.detail === "true";

        // validate id & body
        if ((id.length != 24 && id.length != 12) || id !== req.headers.userId) return res.status(403).json({
            status: false, error: "invalid_id"
        });

        const response = await doctorServices.getAppointsRequests(id, detail)
            .then((v) => ({ success: true, requests: v }))
            .catch(e => ({ success: false, error: e }));

        return res.status(response.success ? 200 : 500).json(response);
    }

    public static confirmAppointRequest: IRouteHandler = async (req, res) => {
        const { doctorId, appointId } = req.params;

        // validate id & body
        if ((doctorId.length != 24 && doctorId.length != 12) || doctorId !== req.headers.userId
            || appointId.length != 24 && appointId.length != 12) return res.status(403).json({
            status: false, error: "invalid_id"
        });

        // todo: notify user that consultation needs to be paid for

        const response = await doctorServices.confirmAppointRequest(doctorId, appointId)
            .then(() => ({ success: true }))
            .catch((e) => ({ success: false, error: e }));

        return res.status(response.success ? 201 : 500).json(response);
    }

    public static rejectAppointRequest: IRouteHandler = async (req, res) => {
        // todo: fix this handler
        const { doctorId, appointId } = req.params;

        // validate id & body
        if ((doctorId.length != 24 && doctorId.length != 12) || doctorId !== req.headers.userId
            || appointId.length != 24 && appointId.length != 12) return res.status(403).json({
            status: false, error: "invalid_id"
        });

        // todo: notify user that consultation is rejected

        const response = await doctorServices.rejectAppointRequest(doctorId, appointId)
            .then(() => ({ success: true }))
            .catch((e) => ({ success: false, error: e }));

        return res.status(response.success ? 200 : 500).json(response);
    }

    public static updateWorkingTime: IRouteHandler = async (req, res) => {
        const { id } = req.params;
        const newTime = req.body;


        const schema = Joi.object({
            from: ValidationHelper.customTimeSchema.default({ h: 8, m: 0 }),
            to: ValidationHelper.customTimeSchema.default({ h: 17, m: 0 }),
            consultationTimeInMin: Joi.number().integer().min(20).max(180).default(40),
            consultationPauseInMin: Joi.number().integer().min(0).default(5),
            weekends: Joi.array().items(Joi.number().integer().min(0).max(6)).unique().default([5, 6]),
            price: Joi.number().integer().min(300),
        });

        const validation = schema.validate(newTime);
        if (validation.error) {
            logger.w("doctor-routes.updateWorkingTime: validate failed", validation.error);
            return res.status(400).json({
                status: false,
                error: "validation_error",
            });
        }

        const response = await doctorServices.updateWorkingTime(id, validation.value as DoctorWorkingType)
            .then(async () => {
                if (validation.value.price) await doctorServices.updatePrice(id, validation.value.price);
                return { success: true };
            })
            .catch((e) => {
                logger.e("doctor-routes.updateWorkingTime: server error happened", e);
                return { success: false, error: "invalid_error" };
            });

        return res.status(response.success ? 500 : 202).json(response);
    }
}


// Routes
Router.post("/doctor", DoctorRoutes.createDoctor);
Router.put("/doctor", token_services.authenticateToken, DoctorRoutes.updateDoctor);
Router.delete("/doctor/:id", token_services.authenticateToken, DoctorRoutes.deleteDoctor);
Router.get("/doctor/:id", DoctorRoutes.getDoctorById);
Router.get("/doctors", DoctorRoutes.getDoctors);
Router.post("/doctor-request/send", DoctorRoutes.sendDoctorRequests);
Router.get("/symptoms", DoctorRoutes.getSymptoms);
Router.post("/doctor/:id/update-links", token_services.authenticateToken, DoctorRoutes.updateLinks);
Router.get("/doctor/:id/appoints", token_services.authenticateToken, DoctorRoutes.getAppoints);
Router.get("/doctor/:id/appoints-requests", token_services.authenticateToken, DoctorRoutes.getAppointsRequests);
Router.post("/doctor/:doctorId/appoint/:appointId/confirm", token_services.authenticateToken, DoctorRoutes.confirmAppointRequest);
Router.post("/doctor/:doctorId/appoint/:appointId/reject", token_services.authenticateToken, DoctorRoutes.rejectAppointRequest);
Router.post("/doctor/:id/update-working-time", token_services.authenticateToken, DoctorRoutes.updateWorkingTime);

export default Router;
