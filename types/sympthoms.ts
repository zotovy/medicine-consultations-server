import { ESpeciality } from "./services";

export interface ISympthom {
    name: string;
    description: string;
    doctor: ESpeciality;
}

//========================================================================================
/*                                                                                      *
 *                                         HEAD                                         *
 *                                                                                      */
//========================================================================================

export const Amnesia = {
    name: "Амнезия",
    description: "утрата воспоминаний, а иначе потеря памяти.",
};
