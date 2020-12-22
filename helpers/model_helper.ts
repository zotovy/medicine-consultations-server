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


    public static JsonField = <T>(required = false, def: T | undefined = undefined): JsonField<T> => (
        {
            type: String,
            get: ModelHelper.getter<T>(),
            set: ModelHelper.setter<T>(),
            required,
            default: def,
        }
    );

    public static JsonArrayField = <T>(required = false, def: T[] = []): JsonArrayField<any> => (
        {
            type: [String],
            get: (data) => data.map(ModelHelper.getter<T>()),
            set: (data: T[]) => data.map(ModelHelper.setter<T>()),
            required,
            default: def,
        }
    )
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