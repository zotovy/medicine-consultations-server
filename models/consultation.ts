import { Schema, model } from "mongoose";

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

    doctorSpecialty: {
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
});

export default model("Consultation", Consultation);
