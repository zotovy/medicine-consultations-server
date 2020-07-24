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
    consultations: mongoose.Types.ObjectId[];
    reviews: mongoose.Types.ObjectId[];
    notificationEmail: string;
    sendNotificationToEmail: boolean;
    sendMailingsToEmail: boolean;
    createdAt: Date;
    lastActiveAt: Date;
    favourites: mongoose.Types.ObjectId[];
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
    consultations: mongoose.Types.ObjectId[];
    reviews: mongoose.Types.ObjectId[];
    notificationEmail: IUser["notificationEmail"];
    sendNotificationToEmail: IUser["sendNotificationToEmail"];
    sendMailingsToEmail: IUser["sendMailingsToEmail"];
    createdAt: IUser["createdAt"];
    lastActiveAt: IUser["lastActiveAt"];
    favourites: mongoose.Types.ObjectId[];
}

/**
 * Doctor interface model
 */
export interface IDoctor extends IUser {
    education: string;
    yearEducation: [Date, Date];
    blankSeries: string;
    blankNumber: string;
    issueDate: Date;
    speciality: string[];
    beginDoctorDate: Date;
    experience: number;
    rating: number;
    whosFavourite: mongoose.Types.ObjectId[];
    clientsReviews: mongoose.Types.ObjectId[];
    clientsConsultations: mongoose.Types.ObjectId[];
    sheldure: mongoose.Types.ObjectId[];
}

export interface DoctorObject extends UserObject {
    education: IDoctor["education"];
    yearEducation: IDoctor["yearEducation"];
    blankSeries: IDoctor["blankSeries"];
    blankNumber: IDoctor["blankNumber"];
    issueDate: IDoctor["issueDate"];
    speciality: IDoctor["speciality"];
    beginDoctorDate: IDoctor["beginDoctorDate"];
    experience: IDoctor["experience"];
    rating: IDoctor["rating"];
    whosFavourite: IDoctor["whosFavourite"];
    clientsReviews: IDoctor["clientsReviews"];
    clientsConsultations: IDoctor["clientsConsultations"];
    sheldure: IDoctor["sheldure"];
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

/**
 *  Become Doctor Request
 *  Send by client when user submit form to become a doctor
 */
export interface IBecomeDoctor extends Document {
    name: string;
    surname: string;
    phone: string;
    email: string;
    password: string;
    education: string;
    speciality: string;
    yearEducation: string;
    blankSeries: string;
    blankNumber: string;
    issueDate: string;
    experience: string;
    passportIssuedByWhom: string;
    passportSeries: string;
    passportIssueDate: string;
    workExperience: string;
    workPlaces: string;
}
