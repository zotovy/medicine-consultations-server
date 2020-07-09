import { Document } from "mongoose";

/**
 *  Refresh Token model interface
 */
export interface IRefreshToken extends Document {
    value: string;
}

/**
 *  User model interface
 */
export interface IUser extends Document {
    name: string;
    surname: string;
    photoUrl: string;
    phone: number;
    email: string;
    password: string;
    sex: boolean;
    city?: string;
    country?: string;
    consultations: [];
    reviews: [];
    notificationEmail: string;
    sendNotificationToEmail: string;
    sendMailingsToEmail: string;
    createdAt: Date;
    lastActiveAt: Date;
}

/**
 *  Consultation model interface
 */
export interface IConsultation extends Document {
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    doctorPhotoUrl: string;
    doctorSpecialty: string;
    date: string;
    note?: string;
}
