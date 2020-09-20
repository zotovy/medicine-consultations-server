import PaymentRequest from "../models/payment";
import Ajv from "ajv";
import { TPayReq, PayRequestValidationSchema } from "../types/services";
import { ConsPaymentObj } from "../types/models";
import logger from "../logger";

const ajv = new Ajv();

class PaymentServices {
    requestPayment = async (data: any): Promise<TPayReq> => {
        if (ajv.validate(PayRequestValidationSchema, data)) {
            // todo: get url & id from Yandex.kassa
            let request: ConsPaymentObj = {
                ...data,
                paymentId: "23d93cac-000f-5000-8000-126628f15141",
                createdAt: new Date(),
                info: "",
                status: "waiting",
            };
            try {
                const { _id } = await PaymentRequest.create(request);

                logger.i("successfully save payment request");
                return {
                    success: true,
                    url: `http://vk.com/${String(_id)}`,
                };
            } catch (e) {
                logger.e(
                    `Invalid error while save request payment request ${e}`
                );
                return {
                    success: false,
                    error: "invalid_error",
                };
            }
        } else {
            logger.i("Validate incorrect request payment request");
            return {
                success: false,
                error: "not_validated",
            };
        }
    };

    successed = async (id: string): Promise<void> => {
        await PaymentRequest.findOneAndUpdate(
            { paymentId: id },
            { status: "success" }
        );
    };

    canceled = async (id: string): Promise<void> => {
        await PaymentRequest.findOneAndUpdate(
            { paymentId: id },
            { status: "canceled" }
        );
    };

    getStatus = async (id: string): Promise<string> => {
        const req = await PaymentRequest.findById(id);
        // todo: check payment in Yandex.kassa
        return req?.status ?? "error";
    };
}

export default new PaymentServices();
