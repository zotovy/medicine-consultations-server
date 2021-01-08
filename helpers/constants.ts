import { DoctorWorkingType } from "../types/models";

export const defaultDoctorWorkingTime: DoctorWorkingType = {
    consultationTimeInMin: 60,
    from: {
        h: 9,
        m: 0,
    },
    to: {
        h: 18,
        m: 0
    },
    weekends: [5, 6],
    consultationPauseInMin: 5,
}