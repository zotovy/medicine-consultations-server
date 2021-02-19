import {
    IUser,
    UserObject,
    IDoctor,
    DoctorObject,
    IReview,
    ReviewObject,
    BecomeDoctorObj,
    IBecomeDoctor,
    IAdmin,
    AdminObj,
    IConsultation,
    ConsultationObject, IConsultationRequest,
} from "../types/models";
import { EWorkPlan } from "../types/services";

/**
 * Convert IUser --> UserObject
 */
export function IUserToUserObj(e: IUser): UserObject {
    return {
        id: String(e._id),
        fullName: e.fullName,
        name: e.name,
        surname: e.surname,
        patronymic: e.patronymic,
        photoUrl: e.photoUrl,
        phone: e.phone,
        email: e.email,
        password: e.password,
        sex: e.sex,
        city: e.city,
        country: e.country,
        consultations: [...e.consultations],
        reviews: [...e.reviews],
        notificationEmail: e.notificationEmail,
        sendNotificationToEmail: e.sendNotificationToEmail,
        sendMailingsToEmail: e.sendMailingsToEmail,
        createdAt: e.createdAt,
        lastActiveAt: e.lastActiveAt,
        favourites: [...e.favourites],
        age: e.age,
        activeConsultations: [...e.activeConsultations],
        birthday: e.birthday,
        chatsWithHelpers: [...e.chatsWithHelpers],
        consultationRequests: [...e.consultationRequests],
        balance: e.balance,
        transactionHistory: [...e.transactionHistory],
        schedule: [...e.schedule],
    };
}

export function IReviewToReviewObject(e: IReview): ReviewObject {
    return {
        content: e.content,
        doctorId: e.doctorId,
        patientId: e.patientId,
        point: e.point,
        timestamp: e.timestamp,
    };
}

/**
 * Convert IDoctor --> DoctorObject
 */
export function IDoctorToDoctorObj(e: IDoctor): DoctorObject {
    return {
        id: String(e._id),
        fullName: e.fullName,
        name: e.name,
        surname: e.surname,
        patronymic: e.patronymic,
        photoUrl: e.photoUrl,
        phone: e.phone,
        email: e.email,
        password: e.password,
        sex: e.sex,
        city: e.city,
        country: e.country,
        consultations: [...e.consultations],
        reviews: [...e.reviews],
        notificationEmail: e.notificationEmail,
        sendNotificationToEmail: e.sendNotificationToEmail,
        sendMailingsToEmail: e.sendMailingsToEmail,
        createdAt: e.createdAt,
        lastActiveAt: e.lastActiveAt,
        favourites: [...e.favourites],
        beginDoctorDate: e.beginDoctorDate,
        experience: e.experience,
        rating: e.rating,
        schedule: [...e.schedule],
        speciality: [...e.speciality],
        whosFavourite: [...e.whosFavourite],
        blankNumber: e.blankNumber,
        blankSeries: e.blankSeries,
        _education: e._education,
        issueDate: e.issueDate,
        yearEducation: e.yearEducation.toString(),
        passportIssueDate: e.passportIssueDate,
        passportIssuedByWhom: e.passportIssuedByWhom,
        passportSeries: e.passportSeries,
        _workExperience: e._workExperience,
        _workPlaces: e._workPlaces,
        age: e.age,
        isAdult: e.isAdult,
        isChild: e.isChild,
        workPlan: e.workPlan
            ? e.workPlan === "single"
                ? EWorkPlan.Single
                : EWorkPlan.Multiple
            : undefined,
        serviceExperience: e.serviceExperience,
        qualification: e.qualification,
        activeConsultations: [...e.activeConsultations],
        vkLink: e.vkLink,
        instagramLink: e.instagramLink,
        telegramLink: e.telegramLink,
        whatsAppLink: e.whatsAppLink,
        viberLink: e.viberLink,
        emailLink: e.emailLink,
        birthday: e.birthday,
        education: e.education,
        information: e.information,
        workPlaces: e.workPlaces ? [...e.workPlaces] : undefined,
        price: e.price,
        qualificationProofs: e.qualificationProofs,
        workingTime: e.workingTime,
        consultationRequests: e.consultationRequests,
        chatsWithHelpers: [...e.chatsWithHelpers],
        balance: e.balance,
        transactionHistory: [...e.transactionHistory],
    };
}
/**
 * Convert DoctorObject --> BecomeDoctorObj
 */
export function DoctorObjToBecomeDoctorObj(e: DoctorObject): BecomeDoctorObj {
    return {
        id: String(e.id),
        name: e.name,
        surname: e.surname,
        phone: e.phone.toString(),
        email: e.email,
        sex: e.sex,
        password: e.password,
        education: e._education,
        speciality: e.speciality.join(", "),
        yearEducation: e.yearEducation,
        blankSeries: e.blankSeries,
        blankNumber: e.blankNumber,
        issueDate: e.issueDate.toString(),
        experience: e.experience.toString() + " дней",
        passportIssueDate: e.passportIssueDate,
        passportIssuedByWhom: e.passportIssuedByWhom,
        passportSeries: e.passportSeries,
        workExperience: e._workExperience,
        workPlaces: e._workPlaces,
    };
}

export function IBecomeDoctorToBecomeDoctorObj(
    e: IBecomeDoctor
): BecomeDoctorObj {
    return {
        id: String(e.id),
        name: e.name,
        surname: e.surname,
        phone: e.phone,
        email: e.email,
        sex: e.sex,
        password: e.password,
        education: e.education,
        speciality: e.speciality,
        yearEducation: e.yearEducation,
        blankSeries: e.blankSeries,
        blankNumber: e.blankNumber,
        issueDate: e.issueDate,
        experience: e.experience,
        passportIssueDate: e.passportIssueDate,
        passportIssuedByWhom: e.passportIssuedByWhom,
        passportSeries: e.passportSeries,
        workExperience: e.workExperience,
        workPlaces: e.workPlaces,
    };
}

/**
 * Convert IAdmin --> AdminObj
 */
export function IAdminToAdminObj(e: IAdmin): AdminObj {
    return {
        id: String(e.id),
        email: e.email,
        name: e.name,
        password: e.password,
        photoUrl: e.photoUrl,
        role: e.role,
        username: e.username,
    };
}

/**
 * Check is All Array consist <type>
 */
export const consistingOf = (array: any, type: string) => {
    if (!Array.isArray(array)) {
        return false;
    }

    for (let i = 0; i < array.length; i++) {
        if (typeof array[i] !== type) {
            return false;
        }
    }

    return true;
};

/**
 * Check is All Array consist <EnumType>
 */
export function validateByEnum<E>(array: any, e: any): Array<E> | undefined {
    if (!Array.isArray(array)) {
        return undefined;
    }

    const values: string[] = Object.values(e);
    let submitted: E[] = [];
    array.forEach((element: any) => {
        if (values.includes(element)) {
            submitted.push(e[element]);
        }
    });

    if (submitted.length > 0) {
        return submitted;
    }

    return undefined;
}

export const IConsultationToConsultationObj = (
    e: IConsultation
): ConsultationObject => {
    return {
        date: e.date,
        doctor: e.doctor,
        patient: e.patient,
        note: e.note,
        connected: e.connected,
        messages: e.messages,
    };
};


