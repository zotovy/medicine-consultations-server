import nodemailer from "nodemailer";

// @types
import Mail from "nodemailer/lib/mailer";

class EmailServices {
    transporter: Mail | undefined;

    constructor() {
        // create reusable transporter object using the default SMTP transport
        this.transporter = nodemailer.createTransport({
            service: "Yandex",
            auth: {
                user: "the1ime@yandex.ru",
                pass: "TheLime21",
            },
        });
    }

    /** 
        ANCHOR: Send Reset Password Email
        Async send email reset password email to given email using nodemailer

        - input
            email: string,
        - output
            success: boolean
    */
    sendResetPasswordEmail = async (email: string) => {
        // email config
        const config = {
            from: '"Fred Foo 👻" <the1ime@yandex.ru>', // sender address
            to: email, // list of receivers
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // plain text body
            html: "lol",
        };

        // send email
        let info = this.transporter?.sendMail(config, (err) => {
            if (err) {
                console.log(err);
            }
        });

        console.log(info);
    };
}

export default new EmailServices();
