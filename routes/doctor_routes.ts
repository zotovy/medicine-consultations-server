import express from "express";
import rateLimitter from "express-rate-limit";
import doctorServices from "../services/doctor_services";
import { Types } from "mongoose";
import logger from "../logger";
import { ServerError } from "../types/errors";
import encoder from "./encoder";
import symptoms, { BodyParts, BodyPartsToSpecialities } from "../types/sympthoms";
import { DoctorObject, DoctorTile } from "../types/models";
import { transcode } from "buffer";
import { translateSpeciality } from "../types/services";
import token_services from "../services/token_services";
import userServices from "../services/user_services";
import Ajv from "ajv";

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
            const sp : any = [];
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

        console.log(doctors);
    
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

Router.post("/doctor/:id/update-links", token_services.authenticateToken, async (req, res) => {
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
})

Router.get("/doctor/:id/consultation-requests", token_services.authenticateToken, async (req, res) => {
    const { id } = req.params;
    const detail = req.query.detail === "true";

    // validate id & body
    if ((id.length != 24 && id.length != 12) || id !== req.headers.userId) return res.status(400).json({
        status: false, error: "invalid_id"
    });

    const response = await doctorServices.getConsultationRequests(id, detail)
        .then((v) => ({ success: true, requests: v }))
        .catch(e => ({ success: false, error: e }));

    return res.status(response.success ? 200 : 500).json(response);
});

export default Router;
