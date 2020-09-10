import Review from "./review";
import Doctor from "./doctor";
import User from "./doctor";

const setup = async (): Promise<void> => {
    await Review.find({});
    await Doctor.find({});
    await User.find({});
};

export default setup;
