// Doctor consultation / appointments
// Used for schedule

import { Schema, model, Types } from "mongoose";
import { ConsultationDocument, IAppointment } from "../types/models";
import ModelHelper from "../helpers/model_helper";

const Appointment = new Schema({
    from: {
        type: Date,
        required: true,
    },
    to: {
        type: Date,
        required: true,
    },
    consultation: {
        type: Types.ObjectId,
        ref: "Consultation",
        required: true,
    },
    patientName: String,
    phone: Number,
    birthday: Date,
    sex: Boolean,
    chronicDiseases: String,
    symptoms: String,
    documents: ModelHelper.JsonArrayField<ConsultationDocument>(),
});

export default model<IAppointment>("Appointment", Appointment);

