// Doctor consultation / appointments
// Used for schedule

import { Schema, model, Types } from "mongoose";
import { IAppointment } from "../types/models";

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
    }
});

export default model<IAppointment>("Appointment", Appointment);
