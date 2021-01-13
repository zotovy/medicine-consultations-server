import mongoose, { Schema, model } from "mongoose";

// @types
import { IUser } from "../types/models";

const reqiredField = [true, "required_error"];
const uniqueField = [true, "unique_error"];

const UserSchema = new Schema({
    name: {
        type: String,
        required: reqiredField,
        validate: [(value) => value.length > 0, "length_error"],
    },
    surname: {
        type: String,
        required: reqiredField,
        validate: [(value) => value.length > 0, "length_error"],
    },
    // Отчество
    patronymic: {
        type: String,
    },
    fullName: {
        type: String,
        text: true,
    },
    photoUrl: {
        type: String,
    },
    phone: Number,
    email: {
        type: String,
        required: reqiredField,
        unique: uniqueField
    },
    password: {
        type: String,
        required: reqiredField,
        validate: [(value) => value.length >= 6, "length_error"],
    },
    age: Number,
    sex: {
        type: Boolean,
        required: reqiredField,
    },
    city: {
        type: String,
    },
    country: {
        type: String,
    },
    consultations: [ // Consultations which already have gone
        {
            // Store Array<ObjectId> of consultations
            // We can get user with consultation running .populate("consultation")
            type: Schema.Types.ObjectId,
            ref: "Consultation",
        },
    ],
    reviews: [
        {
            // Store Array<ObjectId> of reviews
            // We can get user with reviews running .populate("review")
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    notificationEmail: {
        type: String,
        unique: true,
        required: true,
    },
    sendNotificationToEmail: {
        type: Boolean,
        required: true,
    },
    sendMailingsToEmail: {
        type: Boolean,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: new Date(),
    },
    lastActiveAt: {
        type: Date,
        required: true,
    },
    // List of favourites doctors
    favourites: [
        {
            type: Schema.Types.ObjectId,
            ref: "Doctor",
        },
    ],
    activeConsultations: [ // Consultation which is going now and in the future
        {
            type: Schema.Types.ObjectId,
            ref: "Consultation",
        },
    ],
    birthday: Date,
    chatsWithHelpers: [
        {
            type: Schema.Types.ObjectId,
            ref: "HelpChat"
        }
    ]
});

export default model<IUser>("User", UserSchema);
