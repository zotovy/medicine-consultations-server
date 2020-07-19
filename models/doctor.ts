import mongoose, { Schema, Model } from "mongoose";
import extendedSchema from "mongoose-extend-schema";

// Will extends Doctor model from user
import User from "./user";
import Speciality from "./speciality";
import Review from "./review";
import Consultation from "./consultation";
import Appointment from "./appointment";
import { IDoctor } from "../types/models";

const Doctor: Model<IDoctor> = extendedSchema(
    new Schema({
        speciality: {
            type: Speciality,
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
        whosFavourite: {
            type: [mongoose.Types.ObjectId], // List<UID> who click add this doctor to favourite
            required: true,
            default: [],
        },
        clientsReviews: {
            type: [Review],
            required: true,
            default: [],
        },
        clientConsultations: {
            type: [Consultation],
            required: true,
            default: [],
        },
        sheldure: {
            type: [Appointment],
            required: true,
            default: [],
        },
    }),
    User
);

export default Doctor;
