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
} from "../types/models";

/**
 * Convert IUser --> UserObject
 */
export function IUserToUserObj(e: IUser): UserObject {
    return {
        id: String(e._id),
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
    };
}

export function IReviewToReviewObject(e: IReview): ReviewObject {
    return {
        content: e.content,
        doctorId: e.doctorId,
        patientId: e.patiendId,
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
        clientsConsultations: [...e.clientsConsultations],
        clientsReviews: [...e.clientsReviews],
        experience: e.experience,
        rating: e.rating,
        sheldure: [...e.sheldure],
        speciality: [...e.speciality],
        whosFavourite: [...e.whosFavourite],
        blankNumber: e.blankNumber,
        blankSeries: e.blankSeries,
        education: e.education,
        issueDate: e.issueDate,
        yearEducation: e.yearEducation.toString(),
        passportIssueDate: e.passportIssueDate,
        passportIssuedByWhom: e.passportIssuedByWhom,
        passportSeries: e.passportSeries,
        workExperience: e.workExperience,
        workPlaces: e.workPlaces,
    };
}
/**
 * Convert DoctorObject --> BecomeDoctorObj
 */
export function DoctorObjToBecomeDoctorObj(e: DoctorObject): BecomeDoctorObj {
    return {
        name: e.name,
        surname: e.surname,
        phone: e.phone.toString(),
        email: e.email,
        sex: e.sex,
        password: e.password,
        education: e.education,
        speciality: e.speciality.join(", "),
        yearEducation: e.yearEducation,
        blankSeries: e.blankSeries,
        blankNumber: e.blankNumber,
        issueDate: e.issueDate.toString(),
        experience: e.experience.toString() + " дней",
        passportIssueDate: e.passportIssueDate,
        passportIssuedByWhom: e.passportIssuedByWhom,
        passportSeries: e.passportSeries,
        workExperience: e.workExperience,
        workPlaces: e.workPlaces,
    };
}

export function IBecomeDoctorToBecomeDoctorObj(
    e: IBecomeDoctor
): BecomeDoctorObj {
    return {
        id: e.id,
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
