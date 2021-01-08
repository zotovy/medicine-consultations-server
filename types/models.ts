import mongoose, { Document, Types } from "mongoose";
import { EWorkPlan } from "./services";

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
    fullName: string;
    name: string;
    surname: string;
    patronymic: string;
    age?: number;
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
    activeConsultations: mongoose.Types.ObjectId[];
    birthday?: Date;
}

/**
 *  User object without mongoose functios
 */
export interface UserObject {
    id: IUser["_id"];
    fullName: IUser["fullName"];
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
    age?: IUser["age"];
    activeConsultations: mongoose.Types.ObjectId[];
    birthday?: IUser['birthday'];
}

/**
 * Doctor interface model
 */
export interface IDoctor extends IUser {
    _education: string;
    yearEducation: string;
    blankSeries: string;
    blankNumber: string;
    issueDate: string;
    speciality: string[];
    beginDoctorDate: Date;
    experience: number;
    serviceExperience: number;
    rating: number;
    whosFavourite: mongoose.Types.ObjectId[];
    schedule: (mongoose.Types.ObjectId| IAppointment)[];
    passportIssuedByWhom: string;
    passportSeries: string;
    passportIssueDate: string;
    _workExperience: string;
    _workPlaces: string;
    qualification?: string;
    workPlan?: string;
    isChild?: boolean;
    isAdult?: boolean;
    vkLink?: string,
    instagramLink?: string,
    telegramLink?: string,
    whatsAppLink?: string,
    viberLink?: string,
    emailLink?: string,
    information?: string;
    price: number;
    workPlaces?: DoctorWorkplaceType[];
    education?: DoctorEducationType[];
    qualificationProofs?: DoctorQualificationDocumentType[];
    workingTime: DoctorWorkingType;
    consultationRequests: mongoose.Types.ObjectId[] | IConsultationRequest[];
}

export interface DoctorObject extends UserObject {
    _education: IDoctor["_education"];
    yearEducation: IDoctor["yearEducation"];
    blankSeries: IDoctor["blankSeries"];
    blankNumber: IDoctor["blankNumber"];
    issueDate: IDoctor["issueDate"];
    speciality: IDoctor["speciality"];
    beginDoctorDate: IDoctor["beginDoctorDate"];
    experience: IDoctor["experience"];
    serviceExperience: IDoctor["serviceExperience"];
    rating: IDoctor["rating"];
    whosFavourite: IDoctor["whosFavourite"];
    schedule: IDoctor["schedule"];
    passportIssuedByWhom: IDoctor["passportIssuedByWhom"];
    passportSeries: IDoctor["passportSeries"];
    passportIssueDate: IDoctor["passportIssueDate"];
    _workExperience: IDoctor["_workExperience"];
    _workPlaces: IDoctor["_workPlaces"];
    qualification?: IDoctor["qualification"];
    workPlan?: EWorkPlan;
    isChild?: IDoctor["isChild"];
    isAdult?: IDoctor["isAdult"];
    vkLink?: IDoctor["vkLink"];
    instagramLink?: IDoctor["instagramLink"];
    telegramLink?: IDoctor["telegramLink"];
    whatsAppLink?: IDoctor["whatsAppLink"];
    viberLink?:IDoctor["viberLink"];
    emailLink?: IDoctor["emailLink"];
    information?: IDoctor['information'];
    price: IDoctor['price'];
    workPlaces?: IDoctor['workPlaces'];
    education?: IDoctor['education'];
    qualificationProofs?: IDoctor['qualificationProofs'];
    workingTime: IDoctor['workingTime'];
    consultationRequests: IDoctor['consultationRequests']
}

/**
 * This type used to describe doctor workplace
 */
export type DoctorWorkplaceType = {
    fromYear: number;
    toYear: number;
    organisation: string;
    speciality: string;
}

/**
 * This type used to describe doctor workplace
 */
export type DoctorEducationType = {
    year: number;
    institute: string;
    educationType: Education;
}

/**
 * This type used to describe doctor qualification document
 */
export type DoctorQualificationDocumentType = {
    imageUrl: string;
    name: string;
}

/**
 * This enum used to describe types of doctor education
 */
export enum Education {
    Baccalaureate,  // Бакалавриат
    Specialty,      // Специалитет
    Master,         // Магистратура
}

/**
 * This type used to describe doctor working time
 */
export type DoctorWorkingType = {
    from: {
        h: number,
        m: number,
    },
    to: {
        h: number,
        m: number,
    },
    consultationTimeInMin: number,
    consultationPauseInMin: number,
    weekends: number[],
}

/**
 * Doctor tile interface model
 */
export interface DoctorTile {
    name: string;
    surname: string;
    speciality: string[];
    age?: number;
    photoUrl: string;
    rating: number;
}

/**
 *  Consultation model interface
 */
export interface IConsultation extends Document {
    patient: Types.ObjectId | IUser;
    doctor: Types.ObjectId | IDoctor;
    date: Date;
    note?: string;
    messages: string[];
    connected: (Types.ObjectId | IUser)[];
}

export interface ConsultationObject {
    patientId: IConsultation["patient"];
    doctorId: IConsultation["doctor"];
    date: IConsultation["date"];
    note?: IConsultation["note"];
    messages: IConsultation["messages"];
    connected: IConsultation["connected"];
}

/**
 *  Consultation Request model interface
 */
export interface IConsultationRequest extends Document{
    patient: Types.ObjectId | IUser;
    doctor: Types.ObjectId | IDoctor;
    createdAt: Date;
    appointment: Types.ObjectId | IAppointment;
}

export interface ConsultationRequestObject {
    patient: IConsultationRequest['patient'];
    doctor: IConsultationRequest['doctor'];
    createdAt: IConsultationRequest['createdAt'];
    appointment: IConsultationRequest['appointment'];
}



/**
 * Review model interface
 */
export interface IReview extends Document {
    patientId: string;
    doctorId: string;
    content: string;
    point: number;
    timestamp: Date;
}

export interface ReviewObject {
    patientId: IReview["patientId"];
    doctorId: IReview["doctorId"];
    content: IReview["content"];
    point: IReview["point"];
    timestamp: IReview["timestamp"];
}

/**
 * Appointment model interface
 */
export interface IAppointment extends Document {
    from: Date;
    to: Date;
    consultation: Types.ObjectId | IConsultation;
    patientName: string;
    phone: number;
    birthday: Date;
    sex: boolean;
    chronicDiseases: string;
    symptoms: string;
    documents: ConsultationDocument[];
    numericDate: string;
}

export interface AppointmentObject {
    from: IAppointment["from"];
    to: IAppointment["to"];
    consultation: IAppointment["consultation"];
    patientName: IAppointment["patientName"];
    phone: IAppointment["phone"];
    birthday: IAppointment["birthday"];
    sex: IAppointment["sex"];
    chronicDiseases: IAppointment["chronicDiseases"];
    symptoms: IAppointment["symptoms"];
    documents: IAppointment["documents"];
    numericDate: IAppointment["numericDate"];
}

/**
 * Consultation document object
 */
export type ConsultationDocument = {
    path: string;
    type: "img" | "pdf" | "file";
    size: string;
    name: string;
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
 *  Become Doctor Request mongoose interface
 *  Send by client when user submit form to become a doctor
 */
export interface IBecomeDoctor extends Document {
    name?: string;
    surname?: string;
    phone?: string;
    email?: string;
    sex?: boolean;
    password?: string;
    education?: string;
    speciality?: string;
    yearEducation?: string;
    blankSeries?: string;
    blankNumber?: string;
    issueDate?: string;
    experience?: string;
    passportIssuedByWhom?: string;
    passportSeries?: string;
    passportIssueDate?: string;
    workExperience?: string;
    workPlaces?: string;
}

/**
 * Become Doctor Request Object
 */
export interface BecomeDoctorObj {
    id?: string;
    name?: IBecomeDoctor["name"];
    surname?: IBecomeDoctor["surname"];
    phone?: IBecomeDoctor["phone"];
    email?: IBecomeDoctor["email"];
    sex?: IBecomeDoctor["sex"];
    password?: IBecomeDoctor["password"];
    education?: IBecomeDoctor["education"];
    speciality?: IBecomeDoctor["speciality"];
    yearEducation?: IBecomeDoctor["yearEducation"];
    blankSeries?: IBecomeDoctor["blankSeries"];
    blankNumber?: IBecomeDoctor["blankNumber"];
    issueDate?: IBecomeDoctor["issueDate"];
    experience?: IBecomeDoctor["experience"];
    passportIssuedByWhom?: IBecomeDoctor["passportIssuedByWhom"];
    passportSeries?: IBecomeDoctor["passportSeries"];
    passportIssueDate?: IBecomeDoctor["passportIssueDate"];
    workExperience?: IBecomeDoctor["workExperience"];
    workPlaces?: IBecomeDoctor["workPlaces"];
}

/**
 * Admin Role
 */
export enum AdminRole {
    King = "King",
    Admin = "admin",
    Developer = "Developer",
}

export interface IAdmin extends Document {
    id: string | Types.ObjectId;
    username: string;
    password: string;
    email: string;
    name: string;
    photoUrl: string;
    role: AdminRole;
}

export interface AdminObj {
    id?: IAdmin["id"];
    username: IAdmin["username"];
    password: IAdmin["password"];
    email: IAdmin["email"];
    name: IAdmin["name"];
    photoUrl: IAdmin["photoUrl"];
    role: IAdmin["role"];
}

export interface IAdminHistory extends Document {
    id: string | Types.ObjectId;
    adminId: string;
    whatDid: string;
    payload: string;
    timestamp: Date;
}

export interface AdminHistoryObject {
    id: IAdminHistory["id"];
    adminId: IAdminHistory["adminId"];
    whatDid: IAdminHistory["whatDid"];
    payload: Object;
    timestamp: IAdminHistory["timestamp"];
}

//========================================================================================
/*                                                                                      *
 *                                         MAILS                                        *
 *                                                                                      */
//========================================================================================

/**
 * This interface describe mongoose MailBlocks model
 */
export interface IMailBlocks extends Document {
    // email which services cant send mails
    email: string;
}

/**
 * This interface describe MailBlocks model
 */
export interface MailBlocksObject {
    email: IMailBlocks["email"];
}

/**
 * This interface describe mongoose ResetPasswordRequest model
 */
export interface IResetPasswordRequest extends Document {
    // id of sended user
    userId: String;

    // date of request creation
    timestamp: Date;
}

/**
 * This interface describe MailBlocks model
 */
export interface ResetPasswordRequestObject {
    userId: IResetPasswordRequest["userId"];
    timestamp: IResetPasswordRequest["timestamp"];
}

//========================================================================================
/*                                                                                      *
 *                                        PAYMENT                                       *
 *                                                                                      */
//========================================================================================

export interface IConsPayment extends Document {
    status: string;
    consultationId?: Types.ObjectId;
    paymentId: string;
    doctorId: Types.ObjectId;
    userId: Types.ObjectId;
    amount: number;
    info: string;
    createdAt: Date;
    payAt?: Date;
    canceledAt?: Date;
}

export interface ConsPaymentObj {
    status: "waiting" | "success" | "canceled";
    consultationId?: IConsPayment["consultationId"];
    paymentId: IConsPayment["paymentId"];
    doctorId: IConsPayment["doctorId"];
    userId: IConsPayment["userId"];
    amount: IConsPayment["amount"];
    info: IConsPayment["info"];
    createdAt: IConsPayment["createdAt"];
    payAt?: IConsPayment["payAt"];
    canceledAt?: IConsPayment["canceledAt"];
}
