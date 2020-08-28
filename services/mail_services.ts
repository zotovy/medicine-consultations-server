import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { MailBlocks, ResetPasswordRequest } from "../models/mails";
import logger from "../logger";
import userServices from "./user_services";

class EmailServices {
    transporter: Mail;

    constructor() {
        // create reusable transporter object using the default SMTP transport
        this.transporter = nodemailer.createTransport({
            service: process.env.mailService,
            secure: true, // use SSL
            auth: {
                user: process.env.mail,
                pass: process.env.mailPassword,
            },
        });

        // console.log(
        //     process.env.mailService,
        //     process.env.mail,
        //     process.env.mailPassword
        // );

        // this.sendEmail({
        //     from: '"Fred Foo 👻" <goryzdorovyatestoviy@yandex.ru>',
        //     to: "the1ime@yandex.ru",
        //     subject: "Hello 123", // Subject line
        //     html: "<h1>LOL</h1>",
        // });
        // const res = await this.transporter.sendMail(config).catch((e) => e);
    }

    private sendEmail = async (
        config: TEmailConfig
    ): Promise<TEmailResponse> => {
        const founded = await MailBlocks.find({
            email: config.to,
        }).catch((e) => []);

        if (founded.length > 0) {
            logger.i(
                `Cant send email to ${config.to}, user unsubsubscribed from the mailings`
            );
            return {
                success: false,
                blocked: true,
            };
        }

        const res = await this.transporter.sendMail(config).catch((e) => e);

        if (res instanceof Error) {
            logger.e(`Error while send email to ${config.to}`, res);
            return {
                success: false,
                error: res,
            };
        }

        return {
            success: true,
            info: res,
        };
    };

    private getHtml = (cfg: TGetEmail): string => {
        return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en" style="background:#f3f3f3!important;font-family:Inter,sans-serif!important"><head> <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet"> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"> <meta name="viewport" content="width=device-width"> <title>My Password Email Template Subject</title> <style> @media only screen { html { min-height: 100%; background: #f3f3f3 } } @media only screen and (max-width:596px) { .small-float-center { margin: 0 auto !important; float: none !important; text-align: center !important } } @media only screen and (max-width:596px) { table.body img { width: auto; height: auto } table.body center { min-width: 0 !important } table.body .container { width: 95% !important } table.body .columns { height: auto !important; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; padding-left: 16px !important; padding-right: 16px !important } table.body .columns .columns { padding-left: 0 !important; padding-right: 0 !important } table.body .collapse .columns { padding-left: 0 !important; padding-right: 0 !important } th.small-6 { display: inline-block !important; width: 50% !important } th.small-12 { display: inline-block !important; width: 100% !important } .columns th.small-12 { display: block !important; width: 100% !important } table.menu { width: 100% !important } table.menu td, table.menu th { width: auto !important; display: inline-block !important } table.menu.vertical td, table.menu.vertical th { display: block !important } table.menu[align=center] { width: auto !important } } </style></head><body style="-moz-box-sizing:border-box;-ms-text-size-adjust:100%;-webkit-box-sizing:border-box;-webkit-text-size-adjust:100%;Margin:0;background:#f3f3f3!important;box-sizing:border-box;color:#0a0a0a;font-family:Inter,sans-serif!important;font-size:16px;font-weight:400;line-height:1.2;margin:0;min-width:100%;padding:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;width:100%!important"> <span class="preheader" style="color:#f3f3f3;display:none!important;font-size:1px;line-height:1px;max-height:0;max-width:0;mso-hide:all!important;opacity:0;overflow:hidden;visibility:hidden"></span> <table class="body" style="Margin:0;background:#f3f3f3!important;border-collapse:collapse;border-spacing:0;color:#0a0a0a;font-family:Inter,sans-serif!important;font-size:16px;font-weight:400;height:100%;line-height:1.2;margin:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;width:100%"> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <td class="center" align="center" valign="top" style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.2;margin:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;word-wrap:break-word"> <center style="min-width:580px;width:100%"> <table align="center" class="container float-center" style="Margin:0 auto;background:#fefefe;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:center;vertical-align:top;width:580px"> <tbody> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <td style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.2;margin:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;word-wrap:break-word"> <table class="spacer" style="border-collapse:collapse;border-spacing:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;width:100%"> <tbody> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <td height="20" style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:20px;font-weight:400;hyphens:auto;line-height:20px;margin:0;mso-line-height-rule:exactly;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;word-wrap:break-word"> &nbsp;</td> </tr> </tbody> </table> <table class="row header" style="border-bottom:1px solid #e4e2e2;border-collapse:collapse;border-spacing:0;display:table;padding:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;position:relative;text-align:left;vertical-align:top;width:100%"> <tbody> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <th class="small-12 large-6 columns first" style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0 auto;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.2;margin:0 auto;padding-bottom:16px;padding-left:16px;padding-right:8px;padding-top:0;text-align:left;vertical-align:top;width:274px;word-wrap:break-word"> <table style="border-collapse:collapse;border-spacing:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;width:100%"> <tbody> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <th style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.2;margin:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;word-wrap:break-word"> <h4 class="text-center header__title" style="Margin:0;Margin-bottom:10px;color:#565656;font-family:Inter,sans-serif;font-size:24px;font-weight:700;line-height:1.2;margin:0;margin-bottom:10px;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:center;word-wrap:normal"> НАЗВАНИЕ</h4> </th> </tr> </tbody> </table> </th> <th class="small-12 large-6 columns last" style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0 auto;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.2;margin:0 auto;padding-bottom:16px;padding-left:8px;padding-right:16px;padding-top:0;text-align:left;vertical-align:top;width:274px;word-wrap:break-word"> <table style="border-collapse:collapse;border-spacing:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;width:100%"> <tbody> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <th style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.2;margin:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;word-wrap:break-word"> <table class="spacer" style="border-collapse:collapse;border-spacing:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;width:100%"> <tbody> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <td height="5" style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:5px;font-weight:400;hyphens:auto;line-height:5px;margin:0;mso-line-height-rule:exactly;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;word-wrap:break-word"> &nbsp;</td> </tr> </tbody> </table> <p class="text-center subtitle" style="Margin:0;Margin-bottom:10px;color:#565656;font-family:Inter,sans-serif;font-size:16px;font-weight:400;line-height:1.2;margin:0;margin-bottom:10px;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:center"> ${cfg.header}</p> </th> </tr> </tbody> </table> </th> </tr> </tbody> </table> <table class="row" style="border-collapse:collapse;border-spacing:0;display:table;padding:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;position:relative;text-align:left;vertical-align:top;width:100%"> <tbody> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <col> <table class="spacer" style="border-collapse:collapse;border-spacing:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;width:100%"> <tbody> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <td height="60" style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:60px;font-weight:400;hyphens:auto;line-height:60px;margin:0;mso-line-height-rule:exactly;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;word-wrap:break-word"> &nbsp;</td> </tr> </tbody> </table> <table align="center" class="container" style="Margin:0 auto;background:#fefefe;border-collapse:collapse;border-spacing:0;margin:0 auto;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:inherit;vertical-align:top;width:580px"> <tbody> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <td style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.2;margin:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;word-wrap:break-word"> <center style="min-width:580px;width:100%"> <h1 class="name-title float-center" align="center" style="Margin:0;Margin-bottom:10px;color:#282828;display:block;font-family:Inter,sans-serif!important;font-size:30px;font-weight:600;line-height:1.2;margin:0;margin-bottom:10px;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:center;word-wrap:normal"> Добрый день, <span class="name">${cfg.name}!</span> </h1> </center> <table class="spacer" style="border-collapse:collapse;border-spacing:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;width:100%"> <tbody> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <td height="20" style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:20px;font-weight:400;hyphens:auto;line-height:20px;margin:0;mso-line-height-rule:exactly;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;word-wrap:break-word"> &nbsp;</td> </tr> </tbody> </table> <p class="text-center subtitle" style="Margin:0;Margin-bottom:10px;color:#565656;font-family:Inter,sans-serif;font-size:16px;font-weight:400;line-height:1.2;margin:0;margin-bottom:10px;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:center"> ${cfg.subtitle}</p> <table class="spacer" style="border-collapse:collapse;border-spacing:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;width:100%"> <tbody> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <td height="16" style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:16px;margin:0;mso-line-height-rule:exactly;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;word-wrap:break-word"> &nbsp;</td> </tr> </tbody> </table> <center style="min-width:580px;width:100%"> <div class="password-img float-center" align="center" style="width:160px"><img src="${cfg.imagePath}" alt="image" style="-ms-interpolation-mode:bicubic;clear:both;display:block;max-width:100%;outline:0;text-decoration:none;width:auto"> </div> </center> <table class="spacer" style="border-collapse:collapse;border-spacing:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;width:100%"> <tbody> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <td height="32" style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:32px;font-weight:400;hyphens:auto;line-height:32px;margin:0;mso-line-height-rule:exactly;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;word-wrap:break-word"> &nbsp;</td> </tr> </tbody> </table> <center style="min-width:580px;width:100%"> <table class="button btn expand radius float-center" style="Margin:0 0 16px 0;background-color:#30b9d6!important;border-collapse:collapse;border-radius:5px;border-spacing:0;box-shadow:0 6px 27px 0 rgba(47,185,213,.2)!important;color:#fff!important;float:none;font-family:Inter,sans-serif!important;font-weight:400!important;line-height:1.2!important;margin:0 0 16px 0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:center!important;vertical-align:top;width:80%!important"> <tbody> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <td style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.2;margin:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;word-wrap:break-word"> <table style="border-collapse:collapse;border-spacing:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;width:100%"> <tbody> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <td style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;background:#30b9d6;border:none;border-collapse:collapse!important;border-radius:5px;color:#fefefe;font-family:Inter,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.2;margin:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;word-wrap:break-word"> <center style="min-width:0;width:100%"> <a align="center" href="${cfg.buttonLink}" class="float-center" style="border:0 solid #30b9d6;border-radius:5px;color:#fefefe;display:inline-block;font-family:Inter,sans-serif;font-size:14px;font-weight:400;line-height:1.2;padding:10px 16px 10px 16px;padding-left:0;padding-right:0;text-align:center;text-decoration:none;width:100%"> ${cfg.buttonText}</a> </center> </td> </tr> </tbody> </table> </td> <td class="expander" style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.2;margin:0;padding:0!important;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;visibility:hidden;width:0;word-wrap:break-word"> </td> </tr> </tbody> </table> </center> </td> </tr> </tbody> </table> <table class="spacer" style="border-collapse:collapse;border-spacing:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;width:100%"> <tbody> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <td height="40" style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:40px;font-weight:400;hyphens:auto;line-height:40px;margin:0;mso-line-height-rule:exactly;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;word-wrap:break-word"> &nbsp;</td> </tr> </tbody> </table> <center class="down_line" style="border-bottom:1px solid #e4e2e2;min-width:580px;width:100%"> <p class="description float-center" align="center" style="Margin:0;Margin-bottom:10px;color:#565656;font-family:Inter,sans-serif;font-size:14px;font-weight:400;line-height:1.5;margin:0;margin-bottom:10px;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:center"> ${cfg.description} </p> <table align="center" class="spacer float-center" style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:center;vertical-align:top;width:100%"> <tbody> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <td height="10" style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:10px;font-weight:400;hyphens:auto;line-height:10px;margin:0;mso-line-height-rule:exactly;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;word-wrap:break-word"> &nbsp;</td> </tr> </tbody> </table> <h2 class="help float-center" align="center" style="Margin:0;Margin-bottom:10px;color:#282828;font-family:Inter,sans-serif;font-size:16px;font-weight:600;line-height:1.5;margin:0;margin-bottom:10px;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:center;word-wrap:normal"> Нужна помощь?</h2> <p class="description float-center" align="center" style="Margin:0;Margin-bottom:10px;color:#565656;font-family:Inter,sans-serif;font-size:14px;font-weight:400;line-height:1.5;margin:0;margin-bottom:10px;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:center"> Отправьте нам сообщение<br>на <a href="#" class="description__link" style="color:#30b9d6;font-family:Inter,sans-serif;font-weight:400;line-height:1.2;padding:0;text-align:left;text-decoration:underline">email@email.com</a> </p> <table align="center" class="spacer float-center" style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:center;vertical-align:top;width:100%"> <tbody> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <td height="10" style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:10px;font-weight:400;hyphens:auto;line-height:10px;margin:0;mso-line-height-rule:exactly;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;word-wrap:break-word"> &nbsp;</td> </tr> </tbody> </table> <p class="description-new float-center" align="center" style="Margin:0;Margin-bottom:10px;color:#727272;font-family:Inter,sans-serif;font-size:16px;font-weight:400;line-height:1.5;margin:0;margin-bottom:10px;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:center"> <a target="_blank" href="${cfg.unsubscribeLink}" class="descriptionNew__link" style="color:#727272;font-family:Inter,sans-serif;font-weight:400;line-height:1.2;padding:0;text-align:left;text-decoration:underline">Отписаться</a> от рассылки</p> <table align="center" class="spacer float-center" style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:center;vertical-align:top;width:100%"> <tbody> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <td height="20" style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:20px;font-weight:400;hyphens:auto;line-height:20px;margin:0;mso-line-height-rule:exactly;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;word-wrap:break-word"> &nbsp;</td> </tr> </tbody> </table> </center> <table class="spacer" style="border-collapse:collapse;border-spacing:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;width:100%"> <tbody> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <td height="10" style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:10px;font-weight:400;hyphens:auto;line-height:10px;margin:0;mso-line-height-rule:exactly;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;word-wrap:break-word"> &nbsp;</td> </tr> </tbody> </table> <center style="min-width:580px;width:100%"> <table align="center" class="row collapse social float-center" style="Margin:0 auto;border-collapse:collapse;border-spacing:0;display:table;float:none;margin:0 auto;max-width:200px;padding:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;position:relative;text-align:center;vertical-align:top;width:100%"> <tbody> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <th class="social-img first small-12 large-4 columns first" style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0 auto;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.2;margin:0 auto;padding-bottom:16px;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;width:201.33px;word-wrap:break-word"> <table style="border-collapse:collapse;border-spacing:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;width:100%"> <tbody> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <th style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.2;margin:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;word-wrap:break-word"> <a href="https://vk.com/thelimee" style="color:#30b9d6;font-family:Inter,sans-serif;font-weight:400;line-height:1.2;padding:0;text-align:left;text-decoration:none"><img src="../assets/img/vk.png" alt="VK" style="-ms-interpolation-mode:bicubic;border:none;clear:both;display:block;max-width:100%;outline:0;text-decoration:none;width:50px"></a> </th> </tr> </tbody> </table> </th> <th class="social-img small-12 large-4 columns" style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0 auto;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.2;margin:0 auto;padding-bottom:16px;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;width:193.33px;word-wrap:break-word"> <table style="border-collapse:collapse;border-spacing:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;width:100%"> <tbody> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <th style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.2;margin:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;word-wrap:break-word"> <a href="https://vk.com/thelimee" style="color:#30b9d6;font-family:Inter,sans-serif;font-weight:400;line-height:1.2;padding:0;text-align:left;text-decoration:none"><img src="../assets/img/f.png" alt="facebook" style="-ms-interpolation-mode:bicubic;border:none;clear:both;display:block;max-width:100%;outline:0;text-decoration:none;width:50px"></a> </th> </tr> </tbody> </table> </th> <th class="social-img last small-12 large-4 columns last" style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0 auto;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.2;margin:0 auto;padding-bottom:16px;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;width:201.33px;word-wrap:break-word"> <table style="border-collapse:collapse;border-spacing:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;width:100%"> <tbody> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <th style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.2;margin:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;word-wrap:break-word"> <a href="https://vk.com/thelimee" style="color:#30b9d6;font-family:Inter,sans-serif;font-weight:400;line-height:1.2;padding:0;text-align:left;text-decoration:none"><img src="../assets/img/inst.png" alt="instagram" style="-ms-interpolation-mode:bicubic;border:none;clear:both;display:block;max-width:100%;outline:0;text-decoration:none;width:50px"></a> </th> </tr> </tbody> </table> </th> </tr> </tbody> </table> </center> <table class="spacer" style="border-collapse:collapse;border-spacing:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;width:100%"> <tbody> <tr style="padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top"> <td height="10" style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Inter,sans-serif;font-size:10px;font-weight:400;hyphens:auto;line-height:10px;margin:0;mso-line-height-rule:exactly;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;vertical-align:top;word-wrap:break-word"> &nbsp;</td> </tr> </tbody> </table> </tr> </tbody> </table> </td> </tr> </tbody> </table> </center> </td> </tr> </table><!-- prevent Gmail on iOS font size manipulation --> <div style="display:none;white-space:nowrap;font:15px courier;line-height:0">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div></body></html>`;
    };

    sendResetPasswordMail = async (userId: string): Promise<TEmailResponse> => {
        // Get user by id
        const { success, user } = await userServices.getUserById(userId);

        console.log(
            process.env.mailService,
            process.env.mail,
            process.env.mailPassword
        );

        if (!success) {
            logger.e(
                `Error while sendResetPasswordMail. User with id=${userId} not found.`
            );
            return {
                success: false,
            };
        }

        // Create request
        const request = await ResetPasswordRequest.create({
            userId,
            timestamp: new Date(),
        });

        // Setting
        const name = user?.name ?? "Пользователь";
        const email = user?.email ?? "";
        const id = String(request._id);

        const cfg: TEmailConfig = {
            from: `Горы Здоровья <${process.env.mail}>`,
            to: email,
            subject: `Смена пароля от аккаунта`,
            html: this.getHtml({
                buttonLink:
                    process.env.websiteUrl +
                    "/reset-password/" +
                    String(request._id),
                buttonText: "Сменить пароль",
                description:
                    "Нажмите на кнопку выше чтобы сменить Ваш пароль. Проигнорируйте это сообщение если вы не запрашивали сброс пароля.",
                header: "Сброс Пароля",
                imagePath: "132",
                name,
                subtitle: "Поступил запрос на сброс вашего пароля",
                unsubscribeLink: "www.yandex.com",
            }),
        };

        const res: TEmailResponse = await this.sendEmail(cfg);

        if (res.success) {
            logger.i(`Successfully send reset password email to ${cfg.to}`);
        }

        return res;
    };

    sendAccountConfirmMail = async (email: string): Promise<TEmailResponse> => {
        const cfg: TEmailConfig = {
            from: `Горы Здоровья <${process.env.mail}>`,
            to: email,
            subject: `Подтверждение аккаунта`,
            html: this.getHtml({
                buttonLink: "www.google.com",
                buttonText: "Подтвердить",
                description:
                    "Нажмите на кнопку выше чтобы сменить подтвердить ваш аккаунт. Проигнорируйте это сообщение если вы не регистрировали на горы-здоровья.рф",
                header: "Подтверждение аккаунта",
                imagePath: "132",
                name,
                subtitle: "Спасибо за регистрацию на горы-здоровья.рф",
                unsubscribeLink: "www.yandex.com",
            }),
        };

        const res: TEmailResponse = await this.sendEmail(cfg);

        if (res.success) {
            logger.i(`Successfully send confirm account email to ${cfg.to}`);
        }

        return res;
    };

    sendNewsMail = async (
        email: string,
        header: string,
        html: string
    ): Promise<TEmailResponse> => {
        const cfg: TEmailConfig = {
            from: `Горы Здоровья <${process.env.mail}>`,
            to: email,
            subject: header,
            html,
        };

        const res: TEmailResponse = await this.sendEmail(cfg);

        if (res.success) {
            logger.i(`Successfully send news email to ${cfg.to}`);
        }

        return res;
    };
}

type TEmailConfig = {
    from: string;
    to: string;
    subject: string;
    html: string;
};

type TGetEmail = {
    header: string;
    subtitle: string;
    name: string;
    imagePath: string;
    buttonText: string;
    buttonLink: string;
    description: string;
    unsubscribeLink: string;
};

export type TEmailResponse = {
    success: boolean;
    blocked?: boolean;
    info?: any;
    error?: any;
};

export default new EmailServices();
