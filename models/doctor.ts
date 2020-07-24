import mongoose, { model, Schema } from "mongoose";
import extendedSchema from "mongoose-extend-schema";

// Will extends Doctor model from user
import User from "./user";
import { IDoctor, IBecomeDoctor } from "../types/models";

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

const BecomeDoctorRequestSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    surname: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    education: {
        type: String,
        required: true,
    },
    speciality: {
        type: String,
        required: true,
    },
    yearEducation: {
        type: String,
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
        type: String,
        required: true,
    },
    experience: {
        type: String,
        required: true,
    },
    passportIssuedByWhom: {
        type: String,
        required: true,
    },
    passportSeries: {
        type: String,
        required: true,
    },
    passportIssueDate: {
        type: String,
        required: true,
    },
    workExperience: {
        type: String,
        required: true,
    },
    workPlaces: {
        type: String,
        required: true,
    },
});

export const BecomeDoctorRequest = model<IBecomeDoctor>(
    "BecomeDoctorRequest",
    BecomeDoctorRequestSchema
);
