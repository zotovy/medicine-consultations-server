import { ITransaction, ITransactionModel } from "../types/models";
import User from "../models/user";
import Doctor from "../models/doctor";
import { Logger } from "../logger";

const _logger: Logger = new Logger("BalanceServices");

export default class BalanceServices {

    /**
     * Get balance and history transaction by received user or doctor id
     * @throws "no_user_found" | "no_doctor_found"
     * @param uid
     * @param isUser
     * @param opts
     */
    public static getBalance = async (uid: string, isUser: boolean, opts: GetBalanceOptions = {}): Promise<GetBalance> => {
        // options
        const from = opts.from ?? 0;
        const amount = opts.from ?? 50;

        // use period
        let startPeriodDate, endPeriodDate;
        if (opts.period) {
            const now = new Date();
            switch (opts.period) {
                case "this_month":
                    startPeriodDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    endPeriodDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    break;
                case "this_week":
                    startPeriodDate = new Date(now.setDate(now.getDate() - now.getDay()));
                    endPeriodDate = new Date(now.setDate(now.getDate() - now.getDay() + 6));
                    break;
                case "this_year":
                    startPeriodDate = new Date(now.getFullYear(), 0, 1);
                    endPeriodDate = new Date(now.getFullYear() + 1, 0, 0);
                    break;
                case "x_year":
                    startPeriodDate = new Date(opts.periodPayload, 0, 1);
                    endPeriodDate = new Date(opts.periodPayload + 1, 0, 0);
                    break;
                case "x_month":
                    startPeriodDate = new Date(now.getFullYear(), opts.periodPayload - 1, 1);
                    endPeriodDate = new Date(now.getFullYear(), opts.periodPayload, 0);
                    break;
            }
        }
        
        let query: any = {  };
        if (startPeriodDate) {
            // apply period to query if some period were provided
            query = {
                ...query,
                date: {
                    $lte: endPeriodDate,
                    $gte: startPeriodDate,
                }
            }
        }

        const u = await (isUser ? User : Doctor)
            .findById(uid)
            .populate({
                path: "transactionHistory",
                match: query,
                options: {
                    skip: from,
                    limit: amount,
                }
            })
            .select("transactionHistory balance")
            .lean();
        if (!u) throw `no_${isUser ? "user" : "doctor"}_found`;

        _logger.i(`getBalance – user=${u._id}, balance=${u.balance}, history=${(u.transactionHistory as ITransactionModel[]).map(e => e._id)}`);
        return {
            balance: u.balance,
            history: u.transactionHistory as ITransactionModel[],
        }
    }
}

// ––– TYPES ––––––––––––––––––––––––
type GetBalanceOptions = {
    from?: number,
    amount?: number,
    period: "this_month" | "this_week" | "this_year",
} | {
    from?: number,
    amount?: number,
    period: "x_year" | "x_month",
    periodPayload: number;
} | {
    from?: number,
    amount?: number,
    period?: undefined,
}


type GetBalance = {
    balance: number,
    history: ITransaction[],
}