import { IUser, UserObject } from "../types/models";

/**
 * Convert IUser --> UserObject
 */
export function IUserToUserObj(e: IUser): UserObject {
    return {
        id: e._id,
        name: e.name,
        surname: e.surname,
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
    };
}
