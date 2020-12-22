import Review from "./review";
import Doctor from "./doctor";
import User from "./doctor";
import Appointment from "./appointment";

const setup = async (): Promise<void> => {
    await Appointment.find({});
    await Review.find({});
    await Doctor.find({});
    await User.find({});
};

export default setup;
