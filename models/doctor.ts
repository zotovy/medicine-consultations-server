import mongoose, { model } from "mongoose";
import extendedSchema from "mongoose-extend-schema";

// Will extends Doctor model from user
import User from "./user";
import { IDoctor } from "../types/models";

const Doctor = extendedSchema(User.schema, {
    education: {
        type: String,
        required: true,
    },
    yearEducation: {
        type: [Date, Date],
        required: true,
    },
    blankSeries: {
        type: String,
        required: true,
    },
    blankNumber: {
        type: String,
        required: true,
    },
    issueDate: {
        type: Date,
        required: true,
    },
    speciality: {
        type: [String],
        required: true,
    },
    beginDoctorDate: {
        type: Date,
        required: true,
    },
    experience: Number, // in days
    rating: {
        type: Number, // from 0 to 5
        required: true,
        default: 0,
    },
    whosFavourite: [
        {
            type: mongoose.Types.ObjectId, // List<UID> who click add this doctor to favourite
            ref: "User",
            required: true,
        },
    ],
    clientsReviews: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Review",
            required: true,
        },
    ],
    clientsConsultations: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Consultation",
            required: true,
        },
    ],
    sheldure: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Appointment",
            required: true,
        },
    ],
});

export default model<IDoctor>("Doctor", Doctor);
