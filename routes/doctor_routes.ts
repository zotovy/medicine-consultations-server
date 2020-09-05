import express from "express";
import rateLimitter from "express-rate-limit";
import doctorServices from "../services/doctor_services";
import { Types } from "mongoose";
import logger from "../logger";
import { ServerError } from "../types/errors";
import encoder from "./encoder";
import symptoms, { BodyParts } from "../types/sympthoms";
import { DoctorObject, DoctorTile } from "../types/models";

// Used to process the http request
const Router = express.Router();

const convertDoctorFields = (doctor: any) => {
    if (doctor.lastActiveAt && doctor.createdAt && doctor.beginDoctorDate) {
        // Convert String --> new Date
        doctor.lastActiveAt = new Date(doctor.lastActiveAt);
        doctor.createdAt = new Date(doctor.createdAt);
        doctor.beginDoctorDate = new Date(doctor.beginDoctorDate);
    }
    return doctor;
};

// ANCHOR: POST /doctor
Router.post("/doctor", async (req, res) => {
    const doctor = convertDoctorFields(req.body);

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
});

// ANCHOR: PUT /doctor
Router.put("/doctor", async (req, res) => {
    const doctor = convertDoctorFields(req.body);

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
});

// ANCHOR: DELETE /doctor
Router.delete("/doctor/:id", async (req, res) => {
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
});

// ANCHOR: GET /doctor/:id
Router.get("/doctor/:id", async (req, res) => {
    const id = req.params.id;

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
});

// ANCHOR: GET /doctors
Router.get("/doctors", async (req, res) => {
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
        "bodyParts",
    ];

    const data = encoder.query(req.query, qKeys);

    if (typeof data.from !== "number") {
        data.from = undefined;
    }
    if (typeof data.amount !== "number") {
        data.amount = undefined;
    }

    try {
        let doctors: any = await doctorServices.getAll(
            data,
            data.from,
            data.amount
        );

        if (req.query.type === "tile") {
            doctors = doctors.map((e: DoctorObject) => ({
                name: e.name,
                photoUrl: e.photoUrl,
                rating: e.rating,
                speciality: e.speciality,
                surname: e.surname,
                age: e.age,
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
});

// ANCHOR: POST /doctor-request/send
Router.post("/doctor-request/send", async (req, res) => {
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
});

// ANCHOR: GET /symptoms
Router.get("/symptoms", async (req, res) => {
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
});

export default Router;
