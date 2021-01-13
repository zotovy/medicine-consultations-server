import HelperChat from "../models/support";
import User from "../models/user";
import logger from "../logger";

export default class SupportServices {

    /*
    * @raises "no_user_found"
    */
    public static createChat = async (uid: string, title: string, message: string): Promise<string> => {
        const { _id } = await HelperChat.create({
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

        const u = await User.findByIdAndUpdate(uid, {
            $pull: { chatsWithHelpers: _id, }
        });
        if (!u) throw "no_user_found";

        logger.i(`SupportServices.createChat: successfully create chat: uid=${uid}, title=${title}, message=${message}`);
        return uid;
    }

}