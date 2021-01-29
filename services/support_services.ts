import SupportChatModel from "../models/support";
import User from "../models/user";
import Doctor from "../models/doctor";
import { Logger } from "../logger";
import { SupportChat, SupportProblemType } from "../types/models";

const _logger = new Logger("SupportServices");

export default class SupportServices {

    /**
     * @throws "no_user_found"
     */
    public static createChat = async (uid: string, isUser: boolean, title: string, message: string, problem: SupportProblemType): Promise<string> => {

        const number = Math.random().toString(10).substr(3, 5);
        const { _id } = await SupportChatModel.create({
                user: uid, title, messages: [
                    {
                        date: new Date(),
                        content: message,
                        isUser: true,
                    }
                ],
                timestamp: new Date(),
                problem,
                number,
            readByUser: true,
            }
        );

        const u = await (isUser ? User : Doctor).findByIdAndUpdate(uid, {
            $push: { chatsWithHelpers: _id, }
        });
        if (!u) throw "no_user_found";

        _logger.i(`successfully create chat: uid=${uid}, title=${title}, message=${message}`);
        return number;
    }


    /**
     * @throws "no_user_found"
     * @param uid - user id
     * @param isUser - is user a patient or doctor
     * @param options - from & amount options
     * @default options = { from: 0, amount: 50, limitMessages: 50 }
     */
    public static getQuestions = async (uid: string, isUser: boolean, options: GetQuestionsType = {}): Promise<SupportChat[]> => {
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
        (u.chatsWithHelpers as SupportChat[]) = SupportServices.sliceManyMessage(u.chatsWithHelpers as SupportChat[] ?? [], options.limitMessages);

        _logger.i(`successfully get questions, id=${uid}, isUser=${isUser},`, options, "length =", u.chatsWithHelpers?.length);
        return (u.chatsWithHelpers as SupportChat[] ?? []);
    }

    /**
     * @throws "no_user_found"
     * @throws "no_question_found"
     * @param uid - user id
     * @param questionId
     * @param isUser - is user a patient or doctor
     * @param options - from & amount options
     * @default options = { from: 0, amount: 50, limitQuestions: 50 }
     */
    public static getQuestion = async (uid: string, questionId: string, isUser: boolean, options: GetQuestionType = {}): Promise<SupportChat> => {
        const u = await (isUser ? User : Doctor).findById(uid)
            .populate({
                path: "chatsWithHelpers",
                match: { _id: questionId },
                options: {
                    limit: 1,
                },
            })
            .select("chatsWithHelpers")
            .lean();

        if (!u) throw "no_user_found";
        if (!u.chatsWithHelpers || u.chatsWithHelpers.length === 0) throw "no_question_found";

        // slice messages
        (u.chatsWithHelpers[0] as SupportChat).messages = (u.chatsWithHelpers[0] as SupportChat).messages.slice(0, options.limitMessages ?? 50)

        _logger.i(`successfully get question, uid=${uid}, isUser=${isUser}, qid=${questionId}`, options, u.chatsWithHelpers[0]);
        return u.chatsWithHelpers[0] as SupportChat;
    }

    private static sliceManyMessage = (chats: SupportChat[], limit: number = 50): SupportChat[] => {
        return chats.map(
            (e, i) => {
                e.messages = e.messages.slice(0, limit);
                return e;
            }
        );
    }

    /**
     * @throws "no_question_found"
     * @param questionId
     * @param message
     * @param isUser
     */
    public static sendMessage = async (questionId: string, message: string, isUser: boolean): Promise<void> => {
        const chat = await SupportChatModel.findByIdAndUpdate(questionId, {
            $push: {
                messages: {
                    content: message,
                    isUser,
                    date: new Date(),
                }
            }
        });
        if (!chat) throw "no_question_found";
        _logger.i(`successfully send message, questionId=${questionId}, message=${message}`);
    }

    public static canUserAccessQuestion = (uid: string, qid: string): Promise<boolean> => {
        return SupportChatModel.exists({ _id: qid, user: uid });
    }

    /**
     * @throws "no_question_found"
     * @param id
     * @param value
     */
    public static setCheckedUserMessages = async (id: string, value: boolean): Promise<void> => {
        const chat = await SupportChatModel.findByIdAndUpdate(id, {
            readByUser: value,
        });
        if (!chat) {
            _logger.w("setCheckedUserMessages – no chat found with id", id);
            throw "no_question_found"
        }
        _logger.i("setCheckedUserMessages to", value, "to chat with id", id);
    }
}

type GetQuestionsType = { from?: number, amount?: number, limitMessages?: number };
type GetQuestionType = { limitMessages?: number };
