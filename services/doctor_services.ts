/// <reference path="../declaration/mongoose-extended-schema.d.ts" />

import { Types } from "mongoose";
import Doctor, { BecomeDoctorRequest } from "../models/doctor";
import User from "../models/user";
import Consultation from "../models/consultation";

// types
import {
    AppointmentObject,
    BecomeDoctorObj,
    ConsultationRequestObject,
    DoctorObject, DoctorWorkingType, IAppointment,
    IDoctor,
    IUser
} from "../types/models";

import {
    ESortBy,
    ESpeciality,
    EWorkExperience,
    EWorkPlan,
    IGetDoctorsFilter,
    IGetDoctorsFilterQuery,
    MWorkExperience,
    TCreateDoctor,
    TDoctorValidationErrors, TGetAppointsServiceOptions,
    TGetOneDoctor,
    TLinksUpdate,
    TRemoveDoctor,
    TSaveBecomeDoctorRequest,
    TUpdateDoctor,
    TValidateDoctor,
    TValidationErrorType,
} from "../types/services";

// Services
import userServices from "./user_services";
import consultationServices from "./consultation_services";
import { consistingOf, IDoctorToDoctorObj, validateByEnum, } from "./types_services";
import logger from "../logger";
import { BodyPartsToSpecialities, EBodyParts } from "../types/sympthoms";
import { ConsultationRequest } from "../models/consultation";

class DoctorServices {
    // constructor() {
    //     Review.create({
    //         patientId: "123456789101",
    //         doctorId: "5f44c05f2c5c2939e09994a3",
    //         content: "This is my contexst",
    //         point: 3,
    //         timestamp: new Date(),
    //     });
    // }

    // ANCHOR: validate doctor
    validate = async (
        doctor: any,
        needUnique: boolean = true
    ): Promise<TValidateDoctor> => {
        if (!doctor) {
            return {
                success: false,
                errors: {},
            };
        }

        // Doctor model is extended from User model,
        // so, if obj is not validate as user this will never validated as doctor
        const response = await userServices.validateUser(doctor, needUnique);

        if (!response.success) {
            return {
                success: false,
                errors: response.errors,
            };
        }

        let errors: TDoctorValidationErrors = {};
        const ErrorType = TValidationErrorType;

        // Education
        if (!doctor._education) {
            errors.education = ErrorType.RequiredError;
        } else if (typeof doctor.education !== "string") {
            errors.education = ErrorType.TypeError;
        }

        // Year education
        if (!doctor.yearEducation) {
            errors.yearEducation = ErrorType.RequiredError;
        } else if (typeof doctor.yearEducation !== "string") {
            errors.yearEducation = ErrorType.TypeError;
        }

        // Blanck series
        if (!doctor.blankSeries) {
            errors.blankSeries = ErrorType.RequiredError;
        } else if (typeof doctor.blankSeries !== "string") {
            errors.blankSeries = ErrorType.TypeError;
        }

        // Blanck number
        if (!doctor.blankNumber) {
            errors.blankNumber = ErrorType.RequiredError;
        } else if (typeof doctor.blankNumber !== "string") {
            errors.blankNumber = ErrorType.TypeError;
        }

        // issueDate
        if (!doctor.issueDate) {
            errors.issueDate = ErrorType.RequiredError;
        } else {
            if (typeof doctor.issueDate !== "string") {
                errors.issueDate = ErrorType.TypeError;
            }
        }

        // Speciality
        if (doctor.speciality !== undefined && doctor.speciality !== null) {
            if (!Array.isArray(doctor.speciality)) {
                errors.speciality = ErrorType.TypeError;
            } else {
                for (let i = 0; i < doctor.speciality.length; i++) {
                    if (
                        !Object.keys(ESpeciality).includes(doctor.speciality[i])
                    ) {
                        errors.speciality = ErrorType.TypeError;
                        break;
                    }
                }
            }
        } else errors.speciality = ErrorType.RequiredError;

        // beginDoctorDate
        if (doctor.beginDoctorDate) {
            if (!(doctor.beginDoctorDate instanceof Date)) {
                errors.beginDoctorDate = ErrorType.TypeError;
            }
        } else errors.beginDoctorDate = ErrorType.RequiredError;

        // experience
        if (doctor.experience) {
            if (typeof doctor.experience !== "number") {
                errors.experience = ErrorType.TypeError;
            } else if (doctor.experience < 0) {
                errors.experience = ErrorType.TypeError;
            }
        } else errors.experience = ErrorType.RequiredError;

        // rating
        if (doctor.rating) {
            if (typeof doctor.rating !== "number") {
                errors.rating = ErrorType.TypeError;
            } else if (doctor.rating < 0 || doctor.rating > 5) {
                errors.rating = ErrorType.TypeError;
            }
        } else errors.rating = ErrorType.RequiredError;

        // whosFavourite
        if (doctor.whosFavourite) {
            if (!Array.isArray(doctor.whosFavourite)) {
                errors.whosFavourite = ErrorType.TypeError;
            } else {
                for (let i = 0; i < doctor.whosFavourite.length; i++) {
                    if (!Types.ObjectId.isValid(doctor.whosFavourite[i])) {
                        errors.whosFavourite = ErrorType.TypeError;
                        break;
                    }
                }
            }
        } else errors.whosFavourite = ErrorType.RequiredError;

        // clientsReviews
        if (
            doctor.clientsReviews !== undefined &&
            doctor.clientsReviews !== null
        ) {
            if (!Array.isArray(doctor.clientsReviews)) {
                errors.clientsReviews = ErrorType.TypeError;
            }
        } else errors.clientsReviews = ErrorType.RequiredError;

        // clientConsultations
        if (
            doctor.clientsConsultations !== undefined &&
            doctor.clientsConsultations !== null
        ) {
            if (!Array.isArray(doctor.clientsConsultations)) {
                errors.clientsConsultations = ErrorType.TypeError;
            }
        } else errors.clientsConsultations = ErrorType.RequiredError;

        // sheldure
        if (doctor.sheldure) {
            if (!Array.isArray(doctor.sheldure)) {
                errors.sheldure = ErrorType.TypeError;
            }
        } else errors.sheldure = ErrorType.RequiredError;

        if (Object.keys(errors).length == 0) {
            return {
                success: true,
            };
        } else {
            return {
                success: false,
                errors,
            };
        }
    };

    // ANCHOR: create doctor
    create = async (data: DoctorObject): Promise<TCreateDoctor> => {
        // validate doctor type
        const response = await this.validate(data);

        if (!response.success || response.errors === {}) {
            logger.w(`user is not validated, errors=${response.errors}`);
            return {
                success: false,
                error: "not_validated_error",
                errors: response.errors,
                message: "User is not validated",
            };
        }

        data.password = userServices.encryptPassword(data.password);

        const doctor: IDoctor = new Doctor(data);

        if (!doctor) {
            logger.w(`created doctor is null data = ${data}`);
            return {
                success: false,
                error: "created_doctor_is_null",
                message: "Created doctor is null",
            };
        }

        // save doctor to db
        await doctor.save();

        logger.i(`successfully create doctor with id ${doctor._id}`);

        return {
            success: true,
            doctor: IDoctorToDoctorObj(doctor),
        };
    };

    // ANCHOR: update doctor
    update = async (data: DoctorObject): Promise<TUpdateDoctor> => {
        const validation = await this.validate(data, false);

        if (!validation.success) {
            logger.w(`user is not validated, errors=${validation.errors}`);
            return {
                success: false,
                error: "not_validated_error",
                validationErrors: validation.errors,
                message: "Passing doctor object is not validated",
            };
        }

        try {
            const updated: IDoctor | null = await Doctor.findOneAndUpdate(
                { _id: data.id },
                data,
                { new: true }
            );

            if (!updated) {
                logger.w(
                    `Updated user is null. User with id=${data.id} does not exist`
                );
                return {
                    success: false,
                    error: "updated_doctor_is_null",
                    message: `Updated user is null. User with id=${data.id} does not exist`,
                };
            }

            return {
                success: true,
                doctor: IDoctorToDoctorObj(updated),
            };
        } catch (e) {
            logger.e(e, e.stack);
            return {
                success: false,
                error: "invalid_error",
                message: "Invalid error happened",
            };
        }
    };

    // ANCHOR: remove doctor
    delete = async (id: string | Types.ObjectId): Promise<TRemoveDoctor> => {
        const doctor: IDoctor | null = await Doctor.findOne({
            _id: id,
        });

        // no doctor found
        if (!doctor) {
            logger.w(`No user found with id = ${id}`);
            return {
                success: false,
                error: "no_doctor_found",
                message: `No user found with id = ${id}`,
            };
        }

        let error: any;
        let removed: IDoctor | undefined | null;

        // remove doctor
        removed = await doctor.deleteOne();

        // error
        if (error) {
            logger.e(error, error.trace);
            return {
                success: false,
                error: "invalid_error",
                message: `invalid error when doctor.remove()`,
            };
        }

        if (removed) {
            logger.i(`successfully remove user with id=${removed.id}`);
            return {
                success: true,
                doctor: IDoctorToDoctorObj(removed),
            };
        } else {
            logger.w(`Removed user is null, id=${id}`);
            return {
                success: false,
                error: "removed_doctor_is_null",
                message: "Removed user is null",
            };
        }
    };

    // ANCHOR: get one
    getOne = async (
        id: string | Types.ObjectId,
        populated = ""
    ): Promise<TGetOneDoctor> => {
        if (!Types.ObjectId.isValid(id)) {
            logger.w(`Invalid Id were provide, id=${id}`);
            return {
                success: false,
                error: "no_doctor_found",
                message: "Invalid Id were provide",
            };
        }

        const doctor: IDoctor | null = await Doctor.findById(id).populate([
            {
                path: "clientsReviews",
                populate: {
                    path: "patientId",
                    select: {
                        name: 1,
                        surname: 1,
                        photoUrl: 1,
                    },
                    options: {
                        limit: 4, // todo
                        sort: { created: -1 },
                    },
                },
            },
            {
                path: "schedule"
            },
        ]).select("-password -__v")

        if (!doctor) {
            logger.w(`No doctor found, id=${id}`);
            return {
                success: false,
                error: "no_doctor_found",
                message: "Invalid Id were provide",
            };
        }

        logger.i(`successfully get doctor, id=${id}`);
        return {
            success: true,
            doctor: IDoctorToDoctorObj(doctor),
        };
    };

    // ANCHOR: get all
    getAll = async (
        rawFilter?: any,
        from: number = 0,
        amount: number = 50
    ): Promise<DoctorObject[]> => {
        // handle filter
        const filter: IGetDoctorsFilter = this.handleRawGetAllFilter(rawFilter);

        // convert filter --> mongoose query
        const queryFilter: IGetDoctorsFilterQuery = {};

        //* FullName
        if (filter.fullName) {
            queryFilter.fullName = {
                $regex: new RegExp(
                    filter.fullName
                        .split(" ")
                        .map((e) => `(?=.*${e})`)
                        .join("")
                ),
            };
        }

        //* Speciality
        if (filter.speciality) {
            queryFilter.speciality = {
                $in: filter.speciality,
            };
        }

        //* Experience
        if (filter.experience) {
            const queries = filter.experience.map((e) => {
                const area = MWorkExperience[e];
                return {
                    experience: { $gte: area[0], $lte: area[1] ?? undefined },
                };
            });

            if (queryFilter.$or) {
                queryFilter.$or = queryFilter.$or.concat(queries);
            } else {
                queryFilter.$or = queries;
            }
        }

        //* Qualification?
        if (filter.qualification) {
            queryFilter.qualification = {
                $in: filter.qualification,
            };
        }

        //* Rating
        if (filter.rating) {
            const queries = filter.rating.map((e) => {
                return {
                    rating: { $gte: e, $lt: e + 1 },
                };
            });

            if (queryFilter.$or) {
                queryFilter.$or = queryFilter.$or.concat(queries);
            } else {
                queryFilter.$or = queries;
            }
        }

        //* City
        if (filter.city) {
            queryFilter.city = {
                $in: filter.city,
            };
        }

        //* WorkPlan
        if (filter.workPlan) {
            queryFilter.workPlan = {
                $in: filter.workPlan,
            };
        }

        //* IsChild
        if (typeof filter.isChild === "boolean") {
            queryFilter.isChild = filter.isChild;
        }

        //* IsAdult
        if (typeof filter.isAdult === "boolean") {
            queryFilter.isAdult = filter.isAdult;
        }

        const raw = await Doctor.find(queryFilter)
            .sort(filter.sortBy == ESortBy.experience
                ? { experience: filter.isDownward ? 1 : -1 }
                : { rating: filter.isDownward ? 1 : -1 }
            )
            .skip(from)
            .limit(amount);

        return raw.map((e) => IDoctorToDoctorObj(e));
    };

    // ANCHOR: save become doctor request
    saveBecomeDoctorRequest = async (
        request: BecomeDoctorObj
    ): Promise<TSaveBecomeDoctorRequest> => {
        try {
            const email = request.email;

            if (email) {
                const founded = await BecomeDoctorRequest.find({ email });

                if (founded.length >= 3) {
                    logger.i(
                        `Exceeded the limit of request per one email=${email} (3)`
                    );
                    return {
                        success: false,
                        error: "requests_limit_error",
                        message:
                            "Exceeded the limit of request per one email (3)",
                    };
                }
            } else {
                logger.i(`no email found, ignore become doctor request`);
                return {
                    success: true,
                };
            }

            request.password = userServices.encryptPassword(request.password ?? "");

            await BecomeDoctorRequest.create(request);

            logger.i(`successfully save become doctor request for ${email}`);
            return {
                success: true,
            };
        } catch (e) {
            logger.e(e, e.trace);
            return {
                success: false,
                error: "invalid_error",
                message: "Invalid error happened",
            };
        }
    };

    // ANCHOR: handle raw get all filter
    handleRawGetAllFilter = (filter: any): IGetDoctorsFilter => {
        if (typeof filter !== "object" || !filter) {
            // TYPE_ERROR or EMPTY_FILTER_RESPONSE
            return {};
        }


        // This object will be our final filter config
        let config: IGetDoctorsFilter = {};

        //* sortBy
        if (filter.sortBy) {
            if (filter.sortBy == ESortBy.rating) config.sortBy = ESortBy.rating;
            else if (filter.sortBy == ESortBy.experience) config.sortBy = ESortBy.experience;
        }

        //* BodyParts
        if (filter.bodyParts) {
            const field = validateByEnum<EBodyParts>(
                filter.bodyParts,
                EBodyParts
            );

            if (field) {
                config.speciality = [];
                field.forEach(
                    (e) =>
                        // @ts-ignore
                        (config.speciality = config.speciality?.concat(
                            BodyPartsToSpecialities[e]
                        ))
                );
            }
        }

        //* FullName?
        if (typeof filter.fullName === "string") {
            config.fullName = filter.fullName;
        }

        //* IsDownward?
        if (typeof filter.isDownward === "boolean") {
            config.isDownward = filter.isDownward;
        }

        //* Body part
        if (filter.bodyParts) {
            const field = validateByEnum<EBodyParts>(
                filter.bodyParts,
                ESpeciality
            );
            if (field) {
                const specialities: ESpeciality[] = [];
                Object.keys(filter.bodyParts).forEach((e) => {
                    // @ts-ignore
                    const part = BodyPartsToSpecialities[e];
                    if (part) {
                        specialities.push(part);
                    }
                });

                config.speciality = specialities;

            }
        }

        //* Speciality?
        if (filter.speciality) {
            const field = validateByEnum<ESpeciality>(
                filter.speciality,
                ESpeciality
            );

            if (field) {
                config.speciality = field;
            }
        }

        //* Experience?
        if (filter.experience) {
            const field = validateByEnum<EWorkExperience>(
                filter.experience,
                EWorkExperience
            );

            if (field) {
                config.experience = field;
            }
        }

        //* Qualification?
        if (Array.isArray(filter.qualification)) {
            config.qualification = [];
            if (filter.qualification.includes("second"))
                config.qualification.push("second");
            else if (filter.qualification.includes("first"))
                config.qualification.push("first");
            else if (filter.qualification.includes("highest"))
                config.qualification.push("highest");

            if (config.qualification.length === 0)
                config.qualification = undefined;
        }

        //* Rating?
        if (filter.rating) {
            let submitted: number[] = [];
            filter.rating.forEach((element: any) => {
                if (
                    typeof element === "number" &&
                    element >= 0 &&
                    element <= 5
                ) {
                    submitted.push(element);
                }
            });

            if (submitted.length > 0) {
                config.rating = submitted;
            }
        }

        //* City?
        if (filter.city && consistingOf(filter.city, "string")) {
            config.city = filter.city;
        }

        //* WorkPlan
        if (filter.workPlan) {
            const field = validateByEnum<EWorkPlan>(filter.workPlan, EWorkPlan);

            if (field) {
                config.workPlan = field;
            }
        }

        //* isChild
        if (typeof filter.isChild === "boolean") {
            config.isChild = filter.isChild;
        }

        //* isAdult
        if (typeof filter.isAdult === "boolean") {
            config.isAdult = filter.isAdult;
        }

        return config;
    };

    // ANCHOR: offer consultation

    // ! This's using only for testing. DO NOT USE FOR PRODUCTION
    testHandleRawGetAllFilter = (
        filter: any
    ): IGetDoctorsFilter | undefined => {
        if (process.env.MODE === "testing") {
            return this.handleRawGetAllFilter(filter);
        }
    };

    /** This function update links for giving uid */
    updateLinks = async (uid: string, links: TLinksUpdate): Promise<void> => {
        try {
            await Doctor.findByIdAndUpdate(uid, {
                vkLink: links.vk,
                instagramLink: links.instagram,
                telegramLink: links.telegram,
                whatsAppLink: links.whatsApp,
                viberLink: links.viber,
                emailLink: links.email,
            });

            logger.i(`UserServices.updateLinks: successfully update links for user (uid=${uid});`)
        } catch (e) {
            logger.e(`Invalid error happened while update links for user (uid=${uid}): ${e}`);
        }
    }

    /** This function get doctor consultation requests */
    getAppointsRequests = async (uid: string, detail: boolean = false): Promise<ConsultationRequestObject[]> => {
        const populate = detail
            ? [
                { path: "patient", select: "fullName sex city country photoUrl" },
                { path: "appointment" }
            ]
            : [
                { path: "patient", select: "_id fullName photoUrl" },
                { path: "appointment" }
            ]

        const raw = await Doctor.findById(uid)
            .populate({
                path: "consultationRequests",
                populate,
            })
            .select("consultationRequests")
            .lean() as DoctorObject;

        if (!raw || raw.consultationRequests == undefined) {
            logger.w(`trying to get doctor consultation but no doctor found with id=${uid}, raw=`, raw);
            throw "not-found"
        }

        logger.i(`successfully get consultation requests for ${uid}`, raw.consultationRequests);
        return raw.consultationRequests as ConsultationRequestObject[];
    }

    /** converts doctor's string dates to usual JS Date object  */
    public convertDoctorFields = (doctor: any) => {
        if (doctor.lastActiveAt && doctor.createdAt && doctor.beginDoctorDate) {
            // Convert String --> new Date
            doctor.lastActiveAt = new Date(doctor.lastActiveAt);
            doctor.createdAt = new Date(doctor.createdAt);
            doctor.beginDoctorDate = new Date(doctor.beginDoctorDate);
        }
        return doctor;
    };

    public getAppoints = async (id: string, options: TGetAppointsServiceOptions = {}): Promise<(AppointmentObject & { photoUrl?: string })[]> => {

        const findQuery: any = {};
        (Object.keys(options) as (keyof TGetAppointsServiceOptions)[]).forEach((e: keyof TGetAppointsServiceOptions) => findQuery[e] = options[e])

        const raw = await Doctor.findById(id).populate({
            path: "schedule",
            options: { getters: true },
            match: findQuery,
        }).select("schedule").lean();

        if (!raw || raw.schedule == undefined) {
            logger.w(`trying to get doctor appoints but no doctor found with id=${id}, raw=`, raw);
            throw "not-found"
        }

        for (let i = 0; i < (raw.schedule as AppointmentObject[]).length; i++) {
            if ((raw.schedule as AppointmentObject[])[i].documents) {
                for (let j = 0; j < (raw.schedule as AppointmentObject[])[i].documents.length; j++) {
                    (raw.schedule as AppointmentObject[])[i].documents[j] = JSON.parse((raw.schedule as AppointmentObject[])[i].documents[j].toString());
                }
            }
        }

        let appointments: (AppointmentObject & { photoUrl?: string })[] = [];
        for (let i = 0; i < raw.schedule.length; i++) {
            const appoint = raw.schedule[i] as AppointmentObject;
            const consultation = await Consultation.findOne({ _id: appoint.consultation, ...findQuery }).populate({
                path: "patient",
                select: "photoUrl",
            }).select("patient");
            const patient = (consultation ? consultation?.patient : null) as IUser | null;
            appointments.push({
                ...appoint,
                photoUrl: patient?.photoUrl,
            });
        }

        logger.i(`successfully get consultation requests for ${id}`, raw.schedule)
        return appointments;
    }

    public confirmAppointRequest = async (doctorId: string, requestId: string): Promise<void> => {
        const request = await ConsultationRequest.findById(requestId).populate("appointment");
        if (!request) throw "request_not_found";

        // Change doctor
        const doctor = await Doctor.findByIdAndUpdate(doctorId,
            {
                $push: {
                    schedule: request._id,
                    activeConsultations: (request.appointment as AppointmentObject).consultation as Types.ObjectId,
                },
                $pull: {
                    consultationRequests: Types.ObjectId(requestId)
                }
            },
            { new: true }
        ).select("_id");
        if (!doctor) throw "doctor_not_found";

        // Change user
        const patient = await User.findByIdAndUpdate(request.patient,
            {
                $push: {
                    activeConsultations: (request.appointment as AppointmentObject).consultation as Types.ObjectId,
                },
            },
            { new: true }
        ).select("_id");
        if (!patient) throw "patient_not_found";

        logger.i("confirm appoint requests with id =", requestId);
    }

    public rejectAppointRequest = async (doctorId: string, requestId: string): Promise<void> => {
        const request = await ConsultationRequest.findById(requestId)
            .populate("appointment")
            .lean();
        if (!request) throw "request_not_found";

        // Change doctor
        const doctor = await Doctor.updateOne({ _id: doctorId }, {
            $pull: {
                consultationRequests: Types.ObjectId(requestId)
            }
        }).exists();
        if (!doctor) throw "doctor_not_found";

        logger.i("reject appoint requests with id =", requestId);
    }

    public updateWorkingTime = async (id: string, workingTime: DoctorWorkingType): Promise<void> => {
        await Doctor.findByIdAndUpdate(id, { workingTime });
        logger.i("update working time of doctor", id, "to", workingTime);
    }

    public updatePrice = async (id: string, price: number): Promise<void> => {
        await Doctor.findByIdAndUpdate(id, { price });
        logger.i(`update doctor (${id}) price to`, price);
    }
}

export default new DoctorServices();
