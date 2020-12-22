/// <reference path="../declaration/mongoose-extended-schema.d.ts" />

import mongoose, { Model, model, Schema } from "mongoose";
import extendedSchema from "mongoose-extend-schema";

// Will extends Doctor model from user
import User from "./user";
import {
    IDoctor,
    IBecomeDoctor,
    DoctorWorkplaceType,
    DoctorEducationType,
    DoctorQualificationDocumentType, DoctorWorkingType
} from "../types/models";
import logger from "../logger";
import ModelHelper from "../helpers/model_helper";
import { defaultDoctorWorkingTime } from "../helpers/constants";

const Doctor = extendedSchema(User.schema, {
    _education: {
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
    speciality: {
        type: [String],
        required: true,
    },
    beginDoctorDate: {
        type: Date,
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
    _workExperience: {
        type: String,
        required: true,
    },
    _workPlaces: {
        type: String,
        required: true,
    },
    experience: Number, // in days
    serviceExperience: Number, // in days
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
    schedule: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Appointment",
            required: true,
            default: [],
        },
    ],
    workPlan: String,
    isChild: Boolean,
    isAdult: Boolean,
    _qualification: String,
    vkLink: String,
    instagramLink: String,
    telegramLink: String,
    whatsAppLink: String,
    viberLink: String,
    emailLink: String,
    information: String,
    price: {
        type: Number,
        required: true,
        default: 1000,
    },
    workPlaces: ModelHelper.JsonArrayField<DoctorWorkplaceType>(true),
    education: ModelHelper.JsonArrayField<DoctorEducationType>(true),
    qualificationProofs: ModelHelper.JsonArrayField<DoctorQualificationDocumentType>(true),
    workingTime: ModelHelper.JsonField<DoctorWorkingType>(true, defaultDoctorWorkingTime),
});

export default model<IDoctor>("Doctor", Doctor);

const BecomeDoctorRequestSchema = new Schema({
    name: String,
    surname: String,
    phone: String,
    email: String,
    sex: Boolean,
    password: String,
    _education: String,
    speciality: String,
    yearEducation: String,
    blankSeries: String,
    blankNumber: String,
    issueDate: String,
    experience: String,
    passportIssuedByWhom: String,
    passportSeries: String,
    passportIssueDate: String,
    _workExperience: String,
    workPlaces: String,
});

export const BecomeDoctorRequest = model<IBecomeDoctor>(
    "BecomeDoctorRequest",
    BecomeDoctorRequestSchema
);
