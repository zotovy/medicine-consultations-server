import SupportChatModel from "../models/support";
import User from "../models/user";
import Doctor from "../models/doctor";
import { Logger } from "../logger";
import { SupportChat } from "../types/models";

export default class SupportServices {

    private static _logger = new Logger("SupportServices");

    /**
     * @throws "no_user_found"
     */
    public static createChat = async (uid: string, isUser: boolean, title: string, message: string): Promise<string> => {
        const { _id } = await SupportChatModel.create({
                user: uid, title, messages: [
                    {
                        date: new Date(),
                        content: message,
                        isUser: true,
                    }
                ],
                date: new Date()
            }
        );

        const u = await (isUser ? User : Doctor).findByIdAndUpdate(uid, {
            $push: { chatsWithHelpers: _id, }
        });
        if (!u) throw "no_user_found";

        SupportServices._logger.i(`successfully create chat: uid=${uid}, title=${title}, message=${message}`);
        return uid;
    }


    /**
     * @throws "no_user_found"
     * @param uid - user id
     * @param isUser - is user a patient or doctor
     * @param options - from & amount options
     * @default options = { from: 0, amount: 50, limitQuestions: 50 }
     */
    public static getQuestions = async (uid: string, isUser: boolean, options: GetQuestionsType = {} ): Promise<SupportChat[]> => {
        const u = await (isUser ? User : Doctor).findById(uid)
            .populate({
                path: "chatsWithHelpers",
                options: {
                    limit: options.amount ?? 50,
                    skip: options.from ?? 0,
                }
            })
            .select("chatsWithHelpers")
            .lean();

        if (!u) throw "no_user_found";

        // slice messages
        (u.chatsWithHelpers as SupportChat[] ?? []).forEach(
            (e, i) => (u.chatsWithHelpers as SupportChat[])[i].messages = e.messages.slice(0, options.limitMessages ?? 50)
        );

        SupportServices._logger.i(`successfully get questions, id=${uid}, isUser=${isUser}, `, options, "length =", u.chatsWithHelpers?.length);
        return (u.chatsWithHelpers as SupportChat[] ?? []);
    }
}

type GetQuestionsType = { from?: number, amount?: number, limitMessages?: number };
type GetQuestionType = { limitMessages?: number };