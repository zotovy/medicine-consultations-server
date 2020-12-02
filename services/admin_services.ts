import Admin from "../models/admin";
import jwt from "jsonwebtoken";
import Doctor, { BecomeDoctorRequest } from "../models/doctor";

import {
    TLoginAdmin,
    TSubmitBecomeDoctorRequests,
    TCheckAccessToken,
    TCheckRefreshToken,
} from "../types/services";
import tokenServices from "../services/token_services";
import {
    IAdminToAdminObj,
    IBecomeDoctorToBecomeDoctorObj,
} from "./types_services";
import logger from "../logger";
import { AdminAccessToken, AdminRefreshToken } from "../models/tokens";
import admin from "../models/admin";
import token_services from "../services/token_services";
import { BecomeDoctorObj, IBecomeDoctor, AdminRole } from "../types/models";
import FormatHelper from "../helpers/format_helper";

class AdminServices {
    // constructor() {
    //     Admin.create({
    //         email: "the1ime@yandex.ru",
    //         name: "Yaroslav",
    //         password: "12345678",
    //         photoUrl:
    //             "https://preview.redd.it/yzs6bt84uvc51.jpg?width=640&height=480&crop=smart&auto=webp&s=a3d986c90b8b09c9217a2f189b105158e2116e75",
    //         role: AdminRole.Developer,
    //         username: "panda.code",
    //     });
    // }

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
                fullName: FormatHelper.fullName(founded)
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

    // ANCHOR: remove become doctor requests
    removeBecomeDoctorRequest = async (id: string): Promise<boolean> => {
        try {
            let error;

            await BecomeDoctorRequest.remove({ _id: id }, (e) => (error = e));

            if (error) {
                logger.e(`Error while remove become doctor requests ${error}`);
                return false;
            } else {
                return true;
            }
        } catch (e) {
            logger.e(
                `Unxpected Error while remove become doctor requests, id=${id}. ${e}`
            );
            return false;
        }
    };

    // ANCHOR: check refresh token
    checkAccessToken = async (
        adminId: string,
        token: string
    ): Promise<boolean> =>
        await tokenServices.checkToken("jwt_admin_access", adminId, token);

    // ANCHOR: check refresh token
    checkRefreshToken = async (
        adminId: string,
        token: string
    ): Promise<boolean> =>
        await tokenServices.checkToken("jwt_admin_refresh", adminId, token);

    // ANCHOR: is Token Exprired
    isTokenExpired = (token: string): boolean => {
        const isOk = jwt.verify(
            token,
            process.env.jwt_admin_access ?? "",
            (e) => {
                if (e) {
                    return true;
                }
                return false;
            }
        );

        // @ts-ignore
        return isOk;
    };

    // ANCHOR: generate new tokens
    generateTokenAndDeleteOld = async (
        adminId: string,
        oldAccessToken: string,
        oldRefreshToken: string
    ): Promise<{ access: string; refresh: string }> => {
        // Shortcut for loggin
        const onError = (where: "Access" | "Refresh", e: any) => {
            logger.e(
                `Error while remove ${where} admin token. adminId="${adminId}",
                 oldAccessToken="${oldAccessToken}", oldRefreshToken="${oldRefreshToken}".
                 Trace = ${e}`
            );
        };

        // Delete old
        await AdminAccessToken.remove({ value: oldAccessToken }, (e) =>
            onError("Access", e)
        );
        await AdminRefreshToken.remove({ value: oldRefreshToken }, (e) =>
            onError("Refresh", e)
        );

        // Generate news token
        const access = token_services.generateToken(
            adminId,
            "jwt_admin_access"
        );
        const refresh = token_services.generateToken(
            adminId,
            "jwt_admin_refresh"
        );

        // Add new tokens to db
        await AdminAccessToken.create({ value: access });
        await AdminRefreshToken.create({ value: refresh });

        return { access, refresh };
    };

    // ANCHOR: getBecomeDoctorsRequest
    getAllBecomeDoctorsRequests = async (
        amount: number = 50,
        from: number = 0
    ): Promise<Array<BecomeDoctorObj>> => {
        try {
            const raw: Array<IBecomeDoctor> = await BecomeDoctorRequest.find({})
                .skip(from)
                .limit(amount);
            const requests: Array<BecomeDoctorObj> = raw.map(
                (e: IBecomeDoctor) => IBecomeDoctorToBecomeDoctorObj(e)
            );

            return requests;
        } catch (e) {
            logger.e(e, e.stack);
            return [];
        }
    };
}

export default new AdminServices();
