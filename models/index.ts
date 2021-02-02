import Review from "./review";
import Doctor from "./doctor";
import User from "./doctor";
import Appointment from "./appointment";
import SupportChat from "./support";
import TransactionModel from "./transaction-model";
import { ConsultationRequest } from "./consultation";

const setup = async (): Promise<void> => {
    await TransactionModel.findOne({});
    await ConsultationRequest.findOne({});
    await Appointment.findOne({});
    await Review.findOne({});
    await Doctor.findOne({});
    await User.findOne({});
    await SupportChat.findOne({});
};

export default setup;
