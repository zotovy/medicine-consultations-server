import Ajv from "ajv";
import User from "../models/user";
import Doctor from "../models/doctor";
import Consultation from "../models/consultation";
import { ConsultationValidationSchema } from "../types/services";
import { Types } from "mongoose";
import token_services from "./token_services";
import server from "../server";

const throwInvalidError = (): { _id: any } => {
    throw "invalid_error";
};

class ConsultationServices {

    connectedAmount : {[key: string]: number} = {};

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
}

export default new ConsultationServices();
