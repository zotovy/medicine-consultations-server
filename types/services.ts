// @types
import { UserObject, DoctorObject } from "./models";

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
 *  UserServices.checkUserEmailAndPassword(email: string, password : string) function
 */
export type TSendResetPasswordMail = {
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
export enum TSpeciality {
    "Педиатр",
    "Терапевт",
    "Дерматолог",
    "Психолог",
    "Дефектолог",
    "Логопед",
    "Диетолог",
    "Аллерголог",
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
 * This type describe error object from UserServices.getUserById() function
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
