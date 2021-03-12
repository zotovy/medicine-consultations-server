import ejs from "ejs";
import Mail from "nodemailer/lib/mailer";
import nodemailer from "nodemailer";
import { Logger } from "../logger";
import { AppointmentObject, IAppointment, IConsultation, IDoctor, IUser } from "../types/models";
import Appointment from "../models/appointment";
import FormatHelper from "../helpers/format_helper";
import { Schema } from "mongoose";

const logger = new Logger("NotificationServices: ");

export default class NotificationServices {
    private static transporter: Mail;

    public static setup() {
        NotificationServices.transporter = nodemailer.createTransport({
            service: process.env.mailService,
            secure: true, // use SSL
            auth: {
                user: process.env.mail,
                pass: process.env.mailPassword,
            },
        });
    }

    private static async sendEmail(email: string, title: string, content: string): Promise<void> {
        const opts: Mail.Options = {
            html: content,
            from: NotificationServices.sender,
            to: email,
            subject: title,
        }

        NotificationServices.transporter.sendMail(
            opts,
            (err, info) => {
                if (err) {
                    logger.e("error happened while sending mail", { ...opts, text: "*hidden*" }, err);
                }
            }
        );
    }

    private static get sender() {
        return `Горы Здоровья <${process.env.mail}>`;
    }

    private static get templates() {
        return "./assets/templates/";
    }

    private static async getAppoint(appointment: SomeAppoint): Promise<QueriedAppointObject> {

        let id: string = appointment as string;
        if (typeof appointment !== "string") id = appointment._id;

        const appoint = await Appointment.findById(id).populate([
            {
                path: "consultation",
                populate: [
                    {
                        path: "patient",
                        select: "fullName name notificationEmail sendNotificationToEmail"
                    },
                    {
                        path: "doctor",
                        select: "fullName notificationEmail",
                    }
                ]
            }
        ]).lean();

        if (!appoint) {
            throw "appoint_not_found";
        }

        return appoint as QueriedAppointObject;
    }

    /**
     * send email to patient that a doctor confirm his appoint
     * @throws appoint_not_found if invalid appoint was received
     */
    public static async sendDoctorConfirmAppointNotification(appointment: SomeAppoint) {
        const appoint = await NotificationServices.getAppoint(appointment);
        const patient = appoint.consultation.patient;

        const data = {
            header_title: "Консультация подтверждена",
            content_title: `Добрый день, ${appoint.consultation.patient.name}!`,
            content_subtitle: `Доктор подтвердил Вашу консультацию.`,
            content_button_text: "Подключится к консультации",
            content_button_href: `https://healthy-mountains.ru/consultation/${appoint._id}`,
            content_paragraph: `Консультацию ${FormatHelper.formatDate(appoint.from)} была подтверждена доктором. 
                               Вы сможете подключится к ней когда она начнется из своего личного кабинета`,
        };
        const content = await ejs.renderFile(
            NotificationServices.templates + "template.ejs",
            data
        );

        // Check if we can send notification
        if (!patient.sendNotificationToEmail) {
            logger.i(`can't send email to patient ${patient._id} that a doctor confirm his appoint because sendNotificationToEmail is false`);
            return;
        }

        NotificationServices.sendEmail(patient.notificationEmail, "Доктор подтвердил консультацию!", content)
            .then(() => {
                logger.i(`successfully send email to patient ${patient._id} that a doctor confirm his appoint`);
            })
    }

    /**
     * send email to patient that a doctor reject his appoint
     * @throws appoint_not_found if invalid appoint was received
     */
    public static async sendDoctorRejectAppointNotification(appointment: AppointmentObject | IAppointment) {
        const appoint = await NotificationServices.getAppoint(appointment._id);
        const patient = appoint.consultation.patient;

        const opts = {}; // todo: pass correct args to template
        const content = await ejs.renderFile(
            NotificationServices.templates + "doctor-confirm-appoint-notification.ejs", // todo: change template
            opts
        );

        // Check if we can send notification
        if (!patient.sendNotificationToEmail) {
            logger.i(`can't send email to patient ${patient._id} that a doctor reject his appoint because sendNotificationToEmail is false`);
            return;
        }

        NotificationServices.sendEmail(patient.email, "Доктор отказался от консультацию!", content).then(() => {
            logger.i(`successfully send email to patient ${patient._id} that a doctor confirm his appoint`);
        })
    }

    /**
     * send notification about tomorrow appoint the day before
     * @throws appoint_not_found if invalid appoint was received
     */
    public static async sendTomorrowAppointNotification(appointment: AppointmentObject | IAppointment) {
        const appoint = await NotificationServices.getAppoint(appointment._id);
        const patient = appoint.consultation.patient;

        const opts = {}; // todo: pass correct args to template
        const content = await ejs.renderFile(
            NotificationServices.templates + "doctor-confirm-appoint-notification.ejs", // todo: change template
            opts
        );

        // Check if we can send notification
        if (!patient.sendNotificationToEmail) {
            logger.i(`can't send email to patient ${patient._id} that he has appoint tomorrow because sendNotificationToEmail is false`);
            return;
        }

        NotificationServices.sendEmail(
            patient.email,
            `Консультация завтра в ${FormatHelper.time(appoint.from)}`,
            content
        ).then(() => {
            logger.i(`successfully send email to patient ${patient._id} about tomorrow appoint`);
        })
    }

    /**
     * send notification to patient that his consultation started now
     * @throws appoint_not_found if invalid appoint was received
     */
    public static async sendAppointStartNotification(appointment: AppointmentObject | IAppointment) {
        const appoint = await NotificationServices.getAppoint(appointment._id);
        const patient = appoint.consultation.patient;

        const opts = {}; // todo: pass correct args to template
        const content = await ejs.renderFile(
            NotificationServices.templates + "doctor-confirm-appoint-notification.ejs", // todo: change template
            opts
        );

        // Check if we can send notification
        if (!patient.sendNotificationToEmail) {
            logger.i(`can't send email to patient ${patient._id} that he's appoint started because sendNotificationToEmail is false`);
            return;
        }

        NotificationServices.sendEmail(
            patient.email,
            `Консультация началась!`,
            content
        ).then(() => {
            logger.i(`successfully send email to patient ${patient._id} that his consultation starting now`);
        })
    }
}

interface QueriedAppointObject extends AppointmentObject {
    consultation: QueriedConsultationObject
}

interface QueriedConsultationObject extends IConsultation {
    patient: IUser,
    doctor: IDoctor,
}

type SomeAppoint = AppointmentObject | IAppointment | string;

