import mongoose, { Document } from "mongoose";

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
    patronymic: string;
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
 *  User object without mongoose functios
 */
export interface UserObject {
    id: IUser["_id"];
    name: IUser["name"];
    surname: IUser["surname"];
    patronymic: IUser["patronymic"];
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
 * Doctor interface model
 */
export interface IDoctor extends IUser {
    speciality: string;
    beginDoctorDate: Date;
    experince: number;
    rating: number;
    whosFavourite: [mongoose.Types.ObjectId];
    clientReviews: [IReview];
    clientConsultation: [IConsultation];
    sheldure: [IAppointment];
}

export interface DoctorObject {
    speciality: IDoctor["speciality"];
    beginDoctorDate: IDoctor["beginDoctorDate"];
    experince: IDoctor["experince"];
    rating: IDoctor["rating"];
    whosFavourite: [string];
    clientReviews: [ReviewObject];
    clientConsultation: [ConsultationObject];
    sheldure: [AppointmentObject];
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

export interface ConsultationObject {
    patientId: IConsultation["patientId"];
    patientName: IConsultation["patientName"];
    doctorId: IConsultation["doctorId"];
    doctorName: IConsultation["doctorName"];
    doctorPhotoUrl: IConsultation["doctorPhotoUrl"];
    doctorSpecialty: IConsultation["doctorSpecialty"];
    date: IConsultation["date"];
    note?: IConsultation["note"];
}

/**
 * Review model interface
 */
export interface IReview extends Document {
    patiendId: string;
    doctorId: string;
    content: string;
    point: number;
    timestamp: Date;
}

export interface ReviewObject {
    patientId: IReview["patiendId"];
    doctorId: IReview["doctorId"];
    content: IReview["content"];
    point: IReview["point"];
    timestamp: IReview["timestamp"];
}

/**
 * Appointment model interace
 */
export interface IAppointment extends Document {
    from: Date;
    to: Date;
}

export interface AppointmentObject {
    from: IAppointment["from"];
    to: IAppointment["to"];
}

/**
 * Doctor Speciality model interface
 */
export interface ISpeciality extends Document {
    name: string;
}

/**
 *  Doctor Speciality object without mongoose functios
 */
export interface SpecialityType {
    name: ISpeciality["name"];
}
