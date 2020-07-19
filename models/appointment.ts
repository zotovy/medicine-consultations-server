// Doctor consultation / appointments
// Used for sheldure

import { Schema, model } from "mongoose";
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
});

export default model<IAppointment>("Appointment", Appointment);
