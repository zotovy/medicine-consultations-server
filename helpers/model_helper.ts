import { DoctorWorkplaceType } from "../types/models";
import logger from "../logger";

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


    public static JsonField = <T>(): JsonField<T> => (
        {
            type: String,
            get: ModelHelper.getter<T>(),
            set: ModelHelper.setter<T>(),
        }
    );

    public static JsonArrayField = <T>(): JsonArrayField<any> => (
        {
            type: [String],
            get: (data) => data.map(ModelHelper.getter<T>()),
            set: (data: T[]) => data.map(ModelHelper.setter<T>()),
        }
    )

}

export type JsonField<T> = {
    type: StringConstructor;
    get: (data : string) => T;
    set: (data: T) => string;
}

export interface JsonArrayField<T> {
    type: [StringConstructor];
    get: (data: string[]) => T[];
    set: (data: T[]) => string[];
}