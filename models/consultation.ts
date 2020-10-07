import { Schema, model, Types } from "mongoose";
import { IConsultation } from "../types/models";

const requiredField = [true, "required_error"];

const Consultation = new Schema({
    patientId: {
        type: String,
        required: requiredField,
    },

    doctorId: {
        type: String,
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
