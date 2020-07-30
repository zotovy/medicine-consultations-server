import Admin from "../models/admin";
import Doctor, { BecomeDoctorRequest } from "../models/doctor";

import { TLoginAdmin, TSubmitBecomeDoctorRequests } from "../types/services";
import tokenServices from "../services/token_services";
import { IAdminToAdminObj } from "./types_services";
import logger from "../logger";
import { DoctorObject } from "../types/models";
import { AdminAccessToken, AdminRefreshToken } from "../models/tokens";
import { access } from "fs";

class AdminServices {
    // ANCHOR: login
    login = async (
        username: string,
        password: string
    ): Promise<TLoginAdmin> => {
        try {
            const founded = await Admin.findOne({ username, password });

            if (!founded) {
                return {
                    success: false,
                };
            }

            const accessToken = tokenServices.generateToken(
                founded.id.toString(),
                "jwt_admin_access"
            );
            const refreshToken = tokenServices.generateToken(
                founded.id.toString(),
                "jwt_admin_refresh"
            );

            await AdminAccessToken.create({ value: accessToken });
            await AdminRefreshToken.create({ value: refreshToken });

            return {
                success: true,
                admin: IAdminToAdminObj(founded),
                tokens: {
                    access: accessToken,
                    refresh: refreshToken,
                },
            };
        } catch (e) {
            logger.e(e, e.stack);
            return {
                success: false,
            };
        }
    };

    // ANCHOR: submit become doctor requests
    //! This function have no security and do not check any admin token. Do not run this function without checking token
    submitBecomeDoctorRequests = async (
        requestId: string
    ): Promise<TSubmitBecomeDoctorRequests> => {
        try {
            const founded = await BecomeDoctorRequest.findOne({
                _id: requestId,
            });

            // no found
            if (!founded) {
                return {
                    success: false,
                };
            }

            // create doctor for this request
            const doctorObject = {
                id: founded.id,
                name: founded.name,
                surname: founded.surname,
                patronymic: "",
                photoUrl: "",
                phone: parseInt(founded.phone ?? ""),
                email: founded.email,
                password: founded.password,
                sex: founded.sex,
                city: "",
                country: "",
                consultations: [],
                reviews: [],
                notificationEmail: founded.email,
                sendNotificationToEmail: true,
                sendMailingsToEmail: true,
                createdAt: new Date(),
                lastActiveAt: new Date(),
                blankNumber: founded.blankNumber,
                blankSeries: founded.blankSeries,
                education: founded.education,
                issueDate: founded.issueDate,
                yearEducation: founded.yearEducation,
                beginDoctorDate: new Date(),
                clientsConsultations: [],
                clientsReviews: [],
                experience: 0,
                favourites: [],
                rating: 0,
                sheldure: [],
                speciality: [],
                whosFavourite: [],
                passportIssueDate: founded.passportIssueDate,
                passportIssuedByWhom: founded.passportIssuedByWhom,
                passportSeries: founded.passportSeries,
                workExperience: founded.workExperience,
                workPlaces: founded.workPlaces,
            };
            // @ts-ignore
            const doctor = await Doctor.create(doctorObject);

            await doctor.save();

            // remove request
            await BecomeDoctorRequest.deleteOne({ _id: requestId });

            // send email
            // todo: send email

            return {
                success: true,
            };
        } catch (e) {
            logger.e(e, e.stack);
            return {
                success: false,
            };
        }
    };
}

export default new AdminServices();
