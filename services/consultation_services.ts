import Ajv from "ajv";
import User from "../models/user";
import Doctor from "../models/doctor";
import Consultation from "../models/consultation";
import { ConsultationValidationSchema, TGetAppointsServiceOptions } from "../types/services";
import {
    IUser,
    IDoctor,
    AppointmentObject,
    ConsultationRequestObject,
    DoctorObject,
    UserObject,
    ConsultationObject, IConsultation, IAppointment
} from "../types/models";
import { Model, QueryPopulateOptions, Types } from "mongoose";
import token_services from "./token_services";
import server from "../server";
import logger, { Logger } from "../logger";
import Appointment from "../models/appointment";
import ModelHelper from "../helpers/model_helper";

const throwInvalidError = (): { _id: any } => {
    throw "invalid_error";
};

const _logger = new Logger("ConsultationServices");

class ConsultationServices {

    connectedAmount: { [key: string]: number } = {};

    create = async (raw: any): Promise<string> => {
        // if date is instanse of Date --> convert to iso date
        if (raw.date && raw.date instanceof Date)
            raw.date = raw.date.toISOString();

        // validate received raw data
        const ajv = new Ajv({ allErrors: true });
        const valid = ajv.validate(ConsultationValidationSchema, raw);
        if (!valid) {
            const errors = ajv.errors?.map(
                (e) => `${e.dataPath.substring(1)}_${e.keyword}_error`
            );
            throw errors;
        }

        // create consultation
        const { _id } = await Consultation.create(raw).catch(throwInvalidError);
        return String(_id);
    };

    connect = async (
        socket: SocketIO.Socket
    ): Promise<{ room: string; uid: string }> => {
        const {
            consultationId,
            userId,
            isUser,
            accessToken,
        } = socket.handshake.query;

        const ok = await token_services.checkToken(
            "jwt_access",
            userId,
            accessToken
        );

        if (!ok) throw "invalid_token";

        // Check is consultationId correct
        const consultation = await Consultation.findById(consultationId)
            .select("date -_id patientId doctorId")
            .exec();
        ``;

        // Throw error if no Consultation was found
        if (!consultation) throw "no_consultation_found_error";

        const delta = consultation.date.getTime() - new Date().getTime();

        if (delta > 0 || delta < -1.08e7) throw "time_error";

        // Throw error if its not this user
        if (isUser == "true") {
            if (consultation.patient != userId) throw "no_access_error";

            // Add ref to this consultation to doctor
            await User.findByIdAndUpdate(
                userId,
                {
                    $addToSet: {
                        activeConsultations: Types.ObjectId(consultation._id),
                    },
                },
                (_, raw) => {
                    if (!raw) {
                        throw "no_user_found_error";
                    }
                }
            );
        } else {

            if (consultation.doctor != userId) throw "no_access_error";

            // Add ref to this consultation to doctor
            await Doctor.findByIdAndUpdate(
                userId,
                {
                    $addToSet: {
                        activeConsultations: Types.ObjectId(consultation._id),
                    },
                },
                (_, raw) => {
                    if (!raw) {
                        throw "no_user_found_error";
                    }
                }
            );
        }

        const room = `consultation-${consultationId}`;
        socket.join(room);

        if (this.connectedAmount[room] && this.connectedAmount[room] > 1) {
            socket.leaveAll();
            socket.disconnect();
            throw "too_many_users_error"
        }

        if (this.connectedAmount[room]) this.connectedAmount[room] += 1;
        else this.connectedAmount[room] = 1;

        // @ts-ignore
        socket.on("user-connected", (id) => {
            console.log(123);
            socket.broadcast.to(room).emit("user-connected", id);
        });

        socket.on("new_message", (message: string, userId: string) => {
            Consultation.updateOne(
                { _id: consultationId },
                {
                    $push: {
                        messages: message,
                    },
                },
                (err: any, data: any) => {
                    console.log(err, data);
                }
            );
            this._onNewMessage(socket, message, consultationId);
        });

        socket.on("call", (data) => {
            console.log(`call user`, data.from);
            console.log(Object.keys(server.io.sockets.sockets));

            server.io.to(data.userToCall).emit("call", {
                signal: data.signalData,
                from: data.from,
            });
        });

        socket.on("mute", (status) =>
            socket
                .to(`consultation-${consultationId}`)
                .broadcast.emit("mute", status)
        );

        socket.on("disconnect", () => {
            this.connectedAmount[room] -= 1;
            socket.to(`consultation-${consultationId}`).emit("disconnected", socket.id);
        });

        return {
            room: `consultation-${consultationId}`,
            uid: userId,
        };
    };

    private _onNewMessage = (
        socket: SocketIO.Socket,
        message: string,
        consultationId: string
    ): void => {
        socket
            .to(`consultation-${consultationId}`)
            .emit("new_message", message);
    };

    /**
     * @throws "no_user_found"
     * @param uid - doctor or user id
     * @param isUser - is giving id related to user
     * @param options - from, amount and date options
     */
    getUserAppointsDates = async (uid: string, isUser: boolean, options: getUserAppointsDatesOptions = {}): Promise<Date[]> => {
        let match = {};
        if (options.date) {
            const split = options.date.split(".");
            const month = parseInt(split[0]), year = parseInt(split[1]);
            const nextMonth = `${month === 12 ? year + 1 : year}-${month === 12 ? 1 : month + 1}-01`
            match = {
                match: { from: { $gte: `${year}-${month}-01`, $lt: nextMonth } },
            }
        }

        const populate: QueryPopulateOptions[] = [
            { path: "schedule", ...match, select: "from" },
        ];

        const model: Model<IUser | IDoctor> = isUser ? User : Doctor;
        const u = await model
            .findById(uid)
            .populate(populate)
            .select("schedule")
            .skip(options.from ?? 0)
            .limit(options.amount ?? 50)
            .lean();

        if (!u) throw "no_user_found";


        const dates: Date[] = u.schedule
            .map((e) => {
                const d = (e as IAppointment).from;
                return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0);
            })
            .filter((date, i, array) => array.indexOf(date) === i);

        logger.i("ConsultationServices.getUserAppointsDates: successfully get appoints dates, " +
            `uid=${uid}, isUser=${isUser}, options = `, options, "result: ", dates);
        return dates;
    }


    /**
     * @throws not_found if no appoint found
     * @throws access_denied if user have no access to this appoint
     * @param id is appoint id
     * @param userId is patient or doctor id
     */
    public rejectAppoint = async (id: string, userId: string): Promise<void> => {
        const appoint = await Appointment.findById(id)
            .populate({
                path: "consultation",
                select: "doctor patient",
            })
            .select("consultation")
            .lean();

        if (!appoint) throw "not_found";
        const consultation = appoint.consultation as IConsultation;

        const uid = Types.ObjectId(userId);
        console.log(uid, consultation.patient, consultation.doctor);
        if (consultation.patient != uid && consultation.doctor != uid) {
            throw "access_denied";
        }


        const update = {
            $pull: {
                schedule: Types.ObjectId(appoint._id),
            },
        };

        await User.findByIdAndUpdate(consultation.patient, update);
        await Doctor.findByIdAndUpdate(consultation.doctor, update);

        _logger.i(`rejectAppoint – successfully reject appoint id=${appoint._id}`);
    }

    public getAppoints = async (id: string, isUser: boolean, options: TGetAppointsServiceOptions = {}): Promise<(AppointmentObject & { photoUrl?: string })[]> => {

        const findQuery: any = {};
        (Object.keys(options) as (keyof TGetAppointsServiceOptions)[]).forEach((e: keyof TGetAppointsServiceOptions) => findQuery[e] = options[e])

        // get raw schedule
        const raw = await (isUser ? User : Doctor).findById(id).populate({
            path: "schedule",
            options: { getters: true },
            populate: {
                path: "consultation",
                populate: [
                    {
                        path: "doctor",
                        select: "fullName photoUrl",
                    },
                    {
                        path: "patient",
                        select: "fullName photoUrl",
                    }
                ],
            },
            match: findQuery,
        }).select("schedule").lean();

        // no doctor found
        if (!raw || raw.schedule == undefined) {
            logger.w(`trying to get doctor appoints but no doctor found with id=${id}, raw=`, raw);
            throw "not-found"
        }


        // parse documents string --> object
        for (let i = 0; i < (raw.schedule as AppointmentObject[]).length; i++) {
            if ((raw.schedule as AppointmentObject[])[i].documents) {
                for (let j = 0; j < (raw.schedule as AppointmentObject[])[i].documents.length; j++) {
                    if (typeof (raw.schedule as AppointmentObject[])[i].documents[j] !== "string") continue;
                    (raw.schedule as AppointmentObject[])[i].documents[j] = JSON.parse((raw.schedule as AppointmentObject[])[i].documents[j].toString());
                }
            }
        }

        // populate patient or doctor photoUrl
        let appointments: (AppointmentObject & { photoUrl?: string })[] = [];
        for (let i = 0; i < raw.schedule.length; i++) {
            const appoint = raw.schedule[i] as AppointmentObject;
            const consultation = await Consultation.findOne({ _id: appoint.consultation, ...findQuery }).populate({
                path: isUser ? "doctor" : "patient",
                select: "photoUrl",
            }).select(isUser ? "doctor" : "patient");
            const user = (consultation ? consultation?.patient : null) as IUser | IDoctor | null;
            appointments.push({
                ...appoint,
                photoUrl: user?.photoUrl,
            });
        }

        logger.i(`successfully get consultation requests for ${id}, amount=`, raw.schedule.length)
        return appointments;
    }

    /**
     * @throws not_found while no appoint was found
     * @param id is a appoint id
     */
    public getAppointById = async (id: string): Promise<AppointmentObject> => {
        const appoint = await Appointment.findById(id)
            .populate([
                ModelHelper.getDoctorPublicPopulationConfig(),
                ModelHelper.getPatientPublicPopulationConfig(),
                "consultation"
            ])
            .lean()
        if (!appoint) throw "not_found";

        if (appoint.documents) {
            for (let j = 0; j < appoint.documents.length; j++) {
                if (typeof appoint.documents[j] !== "string") continue;
                appoint.documents[j] = JSON.parse(appoint.documents[j].toString());
            }
        }

        return appoint;
    }

    public canUserAccessAppoint = async (appointId: string, userId: string): Promise<boolean> => {
        const query = {
            _id: userId,
            schedule: {
                $in: [Types.ObjectId(appointId)]
            }
        };
        return await User.exists(query) || await Doctor.exists(query);
    }

    /** This function get doctor consultation requests */
    getAppointsRequests = async (uid: string, isUser: boolean, detail: boolean = false): Promise<ConsultationRequestObject[]> => {
        const populate = detail
            ? [
                { path: isUser ? "doctor" : "patient", select: "fullName sex city country photoUrl" },
                { path: "appointment" }
            ]
            : [
                { path: isUser ? "doctor" : "patient", select: "_id fullName photoUrl" },
                { path: "appointment" }
            ]

        const raw = await (isUser ? User : Doctor).findById(uid)
            .populate({
                path: "consultationRequests",
                populate,
            })
            .select("consultationRequests")
            .lean() as DoctorObject | UserObject;

        if (!raw || raw.consultationRequests == undefined) {
            logger.w(`trying to get ${isUser ? "user" : "doctor"} consultation but no doctor found with id=${uid}, raw=`, raw);
            throw "not-found"
        }

        logger.i(`successfully get consultation requests for ${uid}`, raw.consultationRequests);
        return raw.consultationRequests as ConsultationRequestObject[];
    }


}

type getUserAppointsDatesOptions = { from?: number, amount?: number, date?: string };

export default new ConsultationServices();
