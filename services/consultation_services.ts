import Ajv from "ajv";
import User from "../models/user";
import Doctor from "../models/doctor";
import Consultation from "../models/consultation";
import { ConsultationValidationSchema } from "../types/services";
import { IUser, IDoctor, IConsultation } from "../types/models";
import { Model, QueryPopulateOptions, Types } from "mongoose";
import token_services from "./token_services";
import server from "../server";
import logger from "../logger";

const throwInvalidError = (): { _id: any } => {
    throw "invalid_error";
};

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
     getUserConsultationsDates = async (uid: string, isUser: boolean, options: getUserConsultationsDatesOptions = {}): Promise<Date[]> => {

        let match = {};
        if (options.date) {
            const split = options.date.split(".");
            const month = parseInt(split[0]), year = parseInt(split[1]);
            const nextMonth = `${month === 12 ? year + 1 : year}-${month === 12 ? 1 : month + 1}-01`
            match = {
                match: { date: { $gte: `${year}-${month}-01`, $lt: nextMonth } },
            }
        }

        const populate: QueryPopulateOptions[] = [
            { path: "activeConsultations", ...match, select: "date" },
            { path: "consultations", ...match, select: "date" },
        ];

        const model: Model<IUser | IDoctor> = isUser ? User : Doctor;
        const u = await model
            .findById(uid)
            .populate(populate)
            .select("activeConsultations consultation")
            .skip(options.from ?? 0)
            .limit(options.amount ?? 50)
            .lean();

        if (!u) throw "no_user_found";

        const dates: Date[] = (u.activeConsultations.concat(u.consultations))
            .map((e) => {
                const d = (e as IConsultation).date;
                return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0);
            })
             .filter((date, i, array) => array.indexOf(date) === i);

        logger.i("ConsultationServices.getUserConsultationsDates: successfully get consultation dates, " +
            `uid=${uid}, isUser=${isUser}, options = `, options, "result: ", dates);
        return dates;
    }

    /**
     * @throws consultation_not_found
     * @throws doctor_not_found
     * @throws user_not_found
     * @param uid
     * @param id
     */
    public rejectConsultation = async (uid: string, id: string): Promise<void> => {
         const consultation = await Consultation.findById(id).select("patient");
         if (!consultation) throw "consultation_not_found";

         const update = {
             $pull: {
                 activeConsultations: Types.ObjectId(id)
             }
         }

        // Change doctor
        const doctor = await Doctor.findByIdAndUpdate(uid, update);
        if (!doctor) throw "doctor_not_found";

        // Change user
        const user = await User.findByIdAndUpdate(consultation.patient, update)
        if (!user) throw "user_not_found";

        logger.i("ConsultationServices.rejectConsultation: successfully reject consultation with id =", id);
    }
}

type getUserConsultationsDatesOptions = { from?: number, amount?: number, date?: string };

export default new ConsultationServices();
