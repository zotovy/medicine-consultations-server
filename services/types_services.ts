import {
    IUser,
    UserObject,
    IDoctor,
    DoctorObject,
    IReview,
    ReviewObject,
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
    };
}
