import { Schema, model, Types } from "mongoose";
import { IConsultation, IConsultationRequest } from "../types/models";

const requiredField = [true, "required_error"];

const Consultation = new Schema({
    patientId: {
        type: Types.ObjectId,
        ref: "User",
        required: requiredField,
    },
    doctorId: {
        type: Types.ObjectId,
        ref: "Doctor",
        required: requiredField,
    },
    date: {
        type: Date,
        required: requiredField,
    },
    note: {
        type: String,
    },
    messages: {
        type: [{}],
        default: [],
    },
    connected: [
        {
            type: Types.ObjectId,
            ref: "User",
        },
    ],
});

export default model<IConsultation>("Consultation", Consultation);

const ConsultationRequestSchema = new Schema({
    patient: {
        type: Types.ObjectId,
        ref: "User",
        required: requiredField,
    },
    doctor: {
        type: Types.ObjectId,
        ref: "Doctor",
        required: requiredField,
    },
    createdAt: {
        type: Date,
        expires: 129600, // expires in 36 hours
    },
    appointment: {
        type: Types.ObjectId,
        ref: "Appointment",
        required: requiredField,
    },
});

export const ConsultationRequest = model<IConsultationRequest>("ConsultationRequest", ConsultationRequestSchema);