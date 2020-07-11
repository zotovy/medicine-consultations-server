import { Document } from "mongoose";

/**
 *  Refresh Token model interface
 */
export interface IRefreshToken extends Document {
    value: string;
}

/**
 *  User model interface with mongoose functions
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
    sendNotificationToEmail: boolean;
    sendMailingsToEmail: boolean;
    createdAt: Date;
    lastActiveAt: Date;
}

/**
 *  User onject without mongoose functios
 *  Used by self-made user objects
 */
export interface UserObject {
    id: IUser["_id"];
    name: IUser["name"];
    surname: IUser["surname"];
    photoUrl: IUser["photoUrl"];
    phone: IUser["phone"];
    email: IUser["email"];
    password: IUser["password"];
    sex: IUser["sex"];
    city?: IUser["city"];
    country?: IUser["country"];
    consultations: IUser["consultations"];
    reviews: IUser["reviews"];
    notificationEmail: IUser["notificationEmail"];
    sendNotificationToEmail: IUser["sendNotificationToEmail"];
    sendMailingsToEmail: IUser["sendMailingsToEmail"];
    createdAt: IUser["createdAt"];
    lastActiveAt: IUser["lastActiveAt"];
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
