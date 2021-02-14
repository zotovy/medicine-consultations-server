import { DoctorWorkplaceType } from "../types/models";
import logger from "../logger";
import { QueryPopulateOptions } from "mongoose";

export default class ModelHelper {

    private static getter = <T>(): (data: string) => T => (data: string) => {
        try {
            return JSON.parse(data);
        } catch (e) {
            logger.e(e);
            return {} as T;
        }
    };

    private static setter = <T>(): (data: T) => string => (data: T): string => JSON.stringify(data);


    public static JsonField = <T>(required = false, def: T | undefined = undefined): JsonField<T> => (
        {
            type: String,
            get: ModelHelper.getter<T>(),
            set: ModelHelper.setter<T>(),
            required,
            default: def,
        }
    );

    public static JsonArrayField = <T>(required = false, def: T[] = []): JsonArrayField<any> => {
        return (
            {
                type: [String],
                get: (data) => data.map(ModelHelper.getter<T>()),
                set: (data: T[]) => data.map(ModelHelper.setter<T>()),
                required,
                default: def,
            }
        );
    }

    public static getDoctorPublicPopulationConfig = (path = "doctor"): QueryPopulateOptions => ({
        path,
        select: "name surname patronymic fullName photoUrl email age sex city country experience serviceExperience " +
            "rating schedule workPlan isChild isAdult vkLink instagramLink telegramLink whatsAppLink viberLink" +
            "emailLink information price workPlaces education qualificationProofs workingTime"
    })

    public static getPatientPublicPopulationConfig = (path = "patient"): QueryPopulateOptions => ({
        path,
        select: "name surname patronymic fullName photoUrl email age sex city country"
    })
}

export type JsonField<T> = {
    type: StringConstructor;
    get: (data : string) => T;
    set: (data: T) => string;
    required?: boolean;
    default?: T;
}

export interface JsonArrayField<T> {
    type: [StringConstructor];
    get: (data: string[]) => T[];
    set: (data: T[]) => string[];
    required?: boolean;
    default?: T[];
}
