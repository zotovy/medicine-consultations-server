import express from "express";
import rateLimitter from "express-rate-limit";
import doctorServices from "../services/doctor_services";

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

export default Router;
