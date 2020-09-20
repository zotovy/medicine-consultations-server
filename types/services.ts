import ajv from "ajv";
// @types
import {
    UserObject,
    DoctorObject,
    AdminRole,
    AdminObj,
    SpecialityType,
} from "./models";

/**
 *  This type describe return object of UserServices.getUsers() function
 */
export type TGetUsers = {
    // Is operation going success
    success: true | false;

    // Show error if failed
    error?: "invalid_error";

    // Show error message if failed
    message?: string;

    // Return operation results if success
    users?: UserObject[];
};

/**
 *  This type describe return object of
 *  UserServices.checkUserEmailAndPassword(email: string, password : string) function
 */
export type TCheckUserEmailAndPassword = {
    // Is operation going success
    success: true | false;

    // Show error if failed
    error?: "invalid_error" | "invalid_password" | "invalid_email";

    // Show error message if failed
    message?: string;

    // Return operation results if success
    id?: string;
};

/**
 *  This type describe return object of
 *  UserServices.resetPassword(email: string, password : string) function
 */
export type TResetPassword = {
    // Is operation going success
    success: true | false;

    // Show error if failed
    error?:
        | "invalid_error"
        | "no_request_found"
        | "no_user_found"
        | "expired_error"
        | "invalid_password";

    // Show error message if failed
    message?: string;
};

/**
 *  This enum describe types of validation error
 */
export enum TValidationErrorType {
    RequiredError = "required_error",
    TypeError = "type_error",
    UniqueError = "unique_error",
    LengthError = "length_error",
    PhoneFormatError = "phone_format_error",
    EmailFormatError = "email_format_error",
}

/**
 * This type describe error object from UserServices.validateUser() function
 */
export type TUserValidationErrors = {
    name?: TValidationErrorType;
    surname?: TValidationErrorType;
    phone?: TValidationErrorType;
    email?: TValidationErrorType;
    password?: TValidationErrorType;
    sex?: TValidationErrorType;
    consultations?: TValidationErrorType;
    reviews?: TValidationErrorType;
    notificationEmail?: TValidationErrorType;
    sendMailingsToEmail?: TValidationErrorType;
    sendNotificationToEmail?: TValidationErrorType;
    createdAt?: TValidationErrorType;
    lastActiveAt?: TValidationErrorType;
    favourites?: TValidationErrorType;
};

/**
 * This type describe return object from UserServices.validateUser() function
 */
export type TValidateUser = {
    // Is operation going success
    success: true | false;

    // Show error if failed
    errors?: TUserValidationErrors;
};

/**
 * This type describe error object from UserServices.setAvatar() function
 */
export type TSetUserAvatar = {
    // Is operation going success
    success: true | false;

    // Show error if failed
    error?: "invalid_args" | "invalid_error" | "no_user_found";

    // Show error message if failed
    message?: string;
};

/**
 * This type describe error object from UserServices.getUserById() function
 */
export type TGetUserById = {
    // Is operation going success
    success: true | false;

    // Show error if failed
    error?: "no_user_found_error" | "invalid_error";

    // Show error message if failed
    message?: string;

    // Return user if success
    user?: UserObject;
};

/**
 * This type describe error object from UserServices.createUser() function
 */
export type TCreateUser = {
    // Is operation going success
    success: true | false;

    // Show error if failed
    error?:
        | "no_user_found_error"
        | "invalid_error"
        | "no_user_found"
        | "created_user_is_null"
        | "not_validated_error";

    // Validation errors
    errors?: TUserValidationErrors;

    // Show error message if failed
    message?: string;

    // Return created user if success
    user?: UserObject;
};

/**
 * This type describe error object from UserServices.updateUser() function
 */
export type TUpdateUser = {
    // Is operation going success
    success: true | false;

    // Show error if failed
    error?: "updated_user_is_null" | "invalid_error" | "not_validated_error";

    // Show error message if failed
    message?: string;

    // Return updated user if success
    user?: UserObject;

    // Return validation errors if failed validation
    validationErrors?: TUserValidationErrors;
};

/**
 * This type describe error object from UserServices.removeUser() function
 */
export type TRemoveUser = {
    // Is operation going success
    success: true | false;

    // Return error if failed
    error?: "no_user_found" | "invalid_error" | "removed_user_is_null";

    // Return error message if failed
    message?: string;

    // Return user if success
    user?: UserObject;
};

//========================================================================================
/*                                                                                      *
 *                                        Doctor                                        *
 *                                                                                      */
//========================================================================================

/**
 *  This type describe existing doctor's speciality
 */
export enum ESpeciality {
    Pediatrician = "Pediatrician",
    Therapist = "Therapist",
    Dermatologist = "Dermatologist",
    Psychologist = "Psychologist",
    Defectologis = "Defectologis",
    Logopedist = "Logopedist",
    Nutritionist = "Nutritionist",
    Allergist = "Allergist",
    Ophthalmologist = "Ophthalmologist",
    Neurologist = "Neurologist",
    Gynecologis = "Gynecologis",
    Venereologist = "Venereologist",
    Andrologist = "Andrologist",
    Cardiologist = "Cardiologist",
    Pulmonologist = "Pulmonologist",
    Otolaryngologist = "Otolaryngologist",
    Orthopedist = "Orthopedist",
    Dentist = "Dentist",
    Gastroenterologist = "Gastroenterologist",
}

/**
 * This type describe doctor validation errors
 */
export type TDoctorValidationErrors = TUserValidationErrors & {
    education?: TValidationErrorType;
    yearEducation?: TValidationErrorType;
    blankSeries?: TValidationErrorType;
    blankNumber?: TValidationErrorType;
    issueDate?: TValidationErrorType;
    speciality?: TValidationErrorType;
    beginDoctorDate?: TValidationErrorType;
    experience?: TValidationErrorType;
    rating?: TValidationErrorType;
    whosFavourite?: TValidationErrorType;
    clientsReviews?: TValidationErrorType;
    clientsConsultations?: TValidationErrorType;
    sheldure?: TValidationErrorType;
};

/**
 *  This type describe return type of DoctorServices.validate()
 */
export type TValidateDoctor = {
    // Is operation going success
    success: true | false;

    // Show error if failed
    errors?: TDoctorValidationErrors;
};

/**
 * This type describe return type of DoctorServices.create()
 */
export type TCreateDoctor = {
    // Is operation going success
    success: true | false;

    // Show error if failed
    error?:
        | "no_user_found_error"
        | "invalid_error"
        | "no_user_found"
        | "created_doctor_is_null"
        | "not_validated_error";

    // Validation errors
    errors?: TDoctorValidationErrors;

    // Show error message if failed
    message?: string;

    // Return user if success
    doctor?: DoctorObject;
};

/**
 * This type describe returned object from DoctorServices.updateUser() function
 */
export type TUpdateDoctor = {
    // Is operation going success
    success: true | false;

    // Show error if failed
    error?: "updated_doctor_is_null" | "invalid_error" | "not_validated_error";

    // Show error message if failed
    message?: string;

    // Return updated doctor if success
    doctor?: DoctorObject;

    // Return validation errors if failed validation
    validationErrors?: TDoctorValidationErrors;
};

/**
 * This type describe returned object from DoctorServices.removeUser() function
 */
export type TRemoveDoctor = {
    // Is operation going success
    success: true | false;

    // Return error if failed
    error?: "no_doctor_found" | "invalid_error" | "removed_doctor_is_null";

    // Return error message if failed
    message?: string;

    // Return doctor if success
    doctor?: UserObject;
};

/**
 * This type describe returned object from  DoctorServices.getOne() function
 */
export type TGetOneDoctor = {
    // Is operation going success
    success: true | false;

    // Show error if failed
    error?: "invalid_error" | "no_doctor_found";

    // Show error message if failed
    message?: string;

    // Return doctor if success
    doctor?: UserObject;
};

/**
 * This object a config area of work experience filter items
 */
export const AreaWorkExperience = {
    LessYear: [0, 364],
    OneYear: [365, 1094],
    ThreeYears: [1095, 1824],
    FiveYears: [1825, 2190],
    MoreFiveYears: [2190, -1],
};

/**
 * This enum describe work experience filter
 */

export enum EWorkExperience {
    LessYear = "LessYear",
    OneYear = "OneYear",
    ThreeYears = "ThreeYears",
    FiveYears = "FiveYears",
    MoreFiveYears = "MoreFiveYears",
}

/**
 * This type describe doctor qualification
 */
export type TQualification = "second" | "first" | "highest";

/**
 * This enum describe work experience filter
 */
export enum EWorkPlan {
    Single = "Single",
    Multiple = "Multiple",
}

/**
 * This interface describe filter which passed inside DoctorServices.getAll()
 */
export interface IGetDoctorsFilter {
    fullName?: string;
    isDownward?: boolean;
    speciality?: ESpeciality[];
    experience?: EWorkExperience[];
    qualification?: string[];
    rating?: number[];
    city?: string[];
    workPlan?: EWorkPlan[];
    isChild?: boolean;
    isAdult?: boolean;
}

/**
 * This interface describe filter query for mongoose
 */
export interface IGetDoctorsFilterQuery {
    fullName?: {
        $regex: RegExp;
    };
    speciality?: {
        $all: string[];
    };
    $or?: {
        [key: string]: {
            $gte?: number;
            $lte?: number;
            $in?: string[];
        };
    }[];
    qualification?: {
        $in?: string[];
        // $nin: [null, undefined];
    };
    city?: {
        $in?: string[];
        // $nin: [null, undefined];
    };
    workPlan?: {
        $in?: string[];
        // $nin: [null, undefined];
    };
    isChild?: boolean;
    isAdult?: boolean;
}

export const MWorkExperience = {
    LessYear: [0, 364],
    OneYear: [365, 1094],
    ThreeYears: [1095, 1824],
    FiveYears: [1825, 2190],
    MoreFiveYears: [2190],
};

/**
 * This type describe error object from UserServices.saveBecomeDoctorRequest() function
 */
export type TSaveBecomeDoctorRequest = {
    // Is operation going success
    success: true | false;

    // Show error if failed
    error?: "invalid_error" | "requests_limit_error";

    // Show error message if failed
    message?: string;
};

//========================================================================================
/*                                                                                      *
 *                                        ADMINS                                        *
 *                                                                                      */
//========================================================================================

/**
 * This type describe error object from AdminServices.login() function
 */
export type TLoginAdmin = {
    // Is operation going success
    success: boolean;

    // Admin object
    admin?: AdminObj;

    // Tokens
    tokens?: {
        access: string;
        refresh: string;
    };
};

/**
 * This type describe error object from AdminServices.submitBecomeDoctorRequests() function
 */
export type TSubmitBecomeDoctorRequests = {
    // Is operation going success
    success: boolean;
};

export type TCheckAccessToken = boolean;

export type TCheckRefreshToken = boolean;

//========================================================================================
/*                                                                                      *
 *                                        PAYMENT                                       *
 *                                                                                      */
//========================================================================================

export const PayRequestValidationSchema = {
    required: ["doctorId", "userId", "amount"],
    properties: {
        doctorId: {
            type: "string",
            minLength: 12,
            maxLength: 24,
        },
        userId: {
            type: "string",
            minLength: 12,
            maxLength: 24,
        },
        amount: {
            type: "integer",
            minimum: 500,
        },
    },
};

export type TPayReq = {
    success: boolean;
    error?: string;
    url?: string;
};
