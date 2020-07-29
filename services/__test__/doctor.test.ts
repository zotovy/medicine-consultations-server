/// <reference types="../../node_modules/@types/jest/index" />

import mongoose from "mongoose";
import Doctor, { BecomeDoctorRequest } from "../../models/doctor";

// Testable
import doctorServices from "../doctor_services";

// @types
import { DoctorObject, BecomeDoctorObj } from "../../types/models";
import {
    IDoctorToDoctorObj,
    DoctorObjToBecomeDoctorObj,
    IBecomeDoctorToBecomeDoctorObj,
} from "../types_services";
import doctor_services from "../doctor_services";

/**
 *  ? This test module testing doctor services
 *
 *  Every test have similar structure consisting of 3 parts
 *  • Arrange  —— initializes objects and sets the value of data passed to the method for the test.
 *  • Act  —— calls a method for the test with the placed parameters.
 *  • Assert  —— checks that the method for the test works as expected.
 *
 *  The test module is considered passed if all test cases were passed correctly
 *  All test modules will run by `npm run test` after commiting to master. Changes will apply only if all tests were passed
 */

// Sample user will use or modify for some cases
const sampleDoctor: DoctorObject = {
    id: undefined,
    name: "Иван",
    surname: "Иванов",
    patronymic: "Иванович",
    photoUrl: "",
    phone: 79028319028,
    email: "ivanov_ivan@mail.ru",
    password: "ivanovcoolguy911",
    sex: true,
    city: "Москва",
    country: "Россия",
    consultations: [], // will add later
    reviews: [], // will add later
    notificationEmail: "ivanov_ivan@mail.ru",
    sendNotificationToEmail: true,
    sendMailingsToEmail: true,
    createdAt: new Date(),
    lastActiveAt: new Date(),
    blankNumber: "12345678",
    blankSeries: "12345678",
    education: "МГУ",
    issueDate: "21.11.2015",
    yearEducation: "2010 - 2015",
    beginDoctorDate: new Date(),
    clientsConsultations: [], // will add later
    clientsReviews: [], // will add later
    experience: 3 * 365,
    favourites: [], // will add later
    rating: 4.6,
    sheldure: [], // will add later
    speciality: [],
    whosFavourite: [], // will add later
    passportIssueDate: "21.11.2015",
    passportIssuedByWhom: "МВД г. Москвы",
    passportSeries: "123123",
    workExperience: "1 год",
    workPlaces: "Городская поликлиника №1 г. Москва",
};

describe("Test Doctor services", () => {
    let db: mongoose.Mongoose;

    // It's just so easy to connect to the MongoDB Memory Server
    // By using mongoose.connect
    beforeAll(async () => {
        db = await mongoose.connect(
            "mongodb://localhost/db",
            {
                useNewUrlParser: true,
                useCreateIndex: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
            },
            (err: any) => {
                if (err) {
                    console.error(err);
                }
            }
        );
    });

    // Close MongodDB connection after all test cases have done
    afterAll(async () => {
        db.disconnect();
    });

    // Remove all date from mongodb after each test case
    afterEach(async () => {
        await Doctor.remove({});
        await BecomeDoctorRequest.remove({});
    });

    // SECTION: validate()
    describe("Validate doctor", () => {
        // ANCHOR: should validate sample doctor
        /** Validate sample doctor */
        test("should validate sample doctor", async () => {
            //* Act
            const response = await doctorServices.validate(sampleDoctor);

            //* Assert
            expect(response.errors).toBeUndefined();
            expect(response.success).toEqual(true);
        });

        // ANCHOR: shouldn't validate doctor with type errors
        /** Validate doctor with type errors */
        test("shouldn't validate type error", async () => {
            //* Arrange
            const errors = {
                speciality: "type_error",
                beginDoctorDate: "type_error",
                experience: "type_error",
                rating: "type_error",
                whosFavourite: "type_error",
                clientsReviews: "type_error",
                clientsConsultations: "type_error",
                sheldure: "type_error",
            };

            const doctor = {
                ...sampleDoctor,
                speciality: 123,
                beginDoctorDate: 123,
                experience: "123",
                rating: 45,
                whosFavourite: 123,
                clientsReviews: 123,
                clientsConsultations: 123,
                sheldure: 123,
            };

            //* Act
            const responce = await doctorServices.validate(doctor);

            //* Assert
            expect(responce.errors).toEqual(errors);
            expect(responce.success).toBe(false);
        });

        // ANCHOR: shouldn't validate required errors
        /**  Validate doctor with required  errors */
        test("shouldn't validate length errors", async () => {
            //* Arrange
            const errors = {
                speciality: "required_error",
                beginDoctorDate: "required_error",
                rating: "required_error",
                whosFavourite: "required_error",
                clientsReviews: "required_error",
                clientsConsultations: "required_error",
                sheldure: "required_error",
            };

            const doctor = {
                ...sampleDoctor,
                speciality: undefined,
                beginDoctorDate: undefined,
                rating: undefined,
                whosFavourite: undefined,
                clientsReviews: undefined,
                clientsConsultations: undefined,
                sheldure: undefined,
            };

            //* Act
            const responce = await doctorServices.validate(doctor);

            //* Assert
            expect(responce.errors).toEqual(errors);
            expect(responce.success).toBe(false);
        });
    });
    // /SECTION

    // SECTION: create()
    describe("Create Doctor", () => {
        // ANCHOR: should create sample doctor
        /** Create doctor using doctor service. Expect this doctor in db */
        test("should create sample doctor", async () => {
            //* Arrange
            const doctor = sampleDoctor;

            //* Act
            const responce = await doctorServices.create(sampleDoctor);
            doctor.id = responce?.doctor?.id;

            //* Assert
            expect(responce.success).toEqual(true);
            expect(responce.doctor).toEqual(doctor);
            expect(responce.error).toBeFalsy();
            expect(responce.errors).toBeFalsy();
            expect(responce.message).toBeFalsy();

            const doctors = (await Doctor.find({})).map((e) =>
                IDoctorToDoctorObj(e)
            );
            expect(doctors).toEqual([doctor]);
        });

        // ANCHOR: shouldn't create dont'validated user
        /** Passing empty user in function. Expect errors */
        test("shouldn't create don`t validated user", async () => {
            //* Act
            // @ts-ignore
            const responce = await doctorServices.create({});

            //* Assert
            expect(responce.success).toEqual(false);
            expect(responce.doctor).toBeFalsy();
            expect(responce.error).toEqual("not_validated_error");
            expect(responce.errors).toBeTruthy();
            expect(responce.message).toBeTruthy();

            const users = await Doctor.find({});
            expect(users).toEqual([]);
        });
    });
    // /SECTION

    // SECTION: update()
    describe("Update Doctor", () => {
        // ANCHOR: should update sample user
        /** Create user using mongoose. Function should update his */
        test("should update sample user", async () => {
            //* Arrange
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id), name: "Максим" };

            //* Act
            const response = await doctorServices.update(doctor);

            //* Assert
            expect(response.error).toBeFalsy();
            expect(response.success).toBe(true);
            expect(response.doctor).toEqual(doctor);
            expect(response.validationErrors).toBeFalsy();

            const dbDoctor = IDoctorToDoctorObj(
                // @ts-ignore
                await Doctor.findOne({ _id })
            );
            expect(dbDoctor).toEqual(doctor);
        });

        // ANCHOR: shouldn't update not validated user
        /** Create user using mongoose. Function shouldn't update this user with invalid new */
        test("shouldn't update not validated user", async () => {
            //* Arrange
            const doctor = { ...sampleDoctor, clientsConsultations: 123 };
            const errors = { clientsConsultations: "type_error" };

            //* Act
            // @ts-ignore
            const response = await doctorServices.update(doctor);

            //* Assert
            expect(response.success).toBe(false);
            expect(response.error).toEqual("not_validated_error");
            expect(response.doctor).toBeUndefined();
            expect(response.validationErrors).toEqual(errors);
        });

        // ANCHOR: shouldn't update not existing doctor
        /** Pass not existing doctor. Function shouldn't update this doctor */
        test("shouldn't update not existing user", async () => {
            //* Arrange
            const doctor = { ...sampleDoctor, id: "123456789101" };

            //* Act
            const response = await doctorServices.update(doctor);

            //* Assert
            expect(response.success).toBe(false);
            expect(response.error).toEqual("updated_doctor_is_null");
            expect(response.doctor).toBeUndefined();
            expect(response.validationErrors).toBeUndefined();
        });
    });
    // /SECTION

    // SECTION: remove()
    describe("Remove doctor", () => {
        // ANCHOR: should remove sample doctor
        /** Create doctor using mongoose. Function should remove it */
        test("should remove sample doctor", async () => {
            //* Arrange
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };

            //* Act
            const responce = await doctorServices.delete(String(_id));

            //* Assert
            expect(responce.error).toBeUndefined();
            expect(responce.success).toEqual(true);
            expect(responce.doctor).toEqual(doctor);

            const doctors = await Doctor.find({});
            expect(doctors).toEqual([]);
        });

        // ANCHOR: should return error on not existing uid
        /** Pass invalid uid in function. Expect errors */
        test("should return error on not existing uid", async () => {
            //* Arrange
            const id = "imfakeuserid";

            //* Act
            const responce = await doctorServices.delete(id);

            //* Assert
            expect(responce.success).toEqual(false);
            expect(responce.error).toEqual("no_doctor_found");
            expect(responce.doctor).toBeUndefined();
            expect(responce.message).toBeDefined();
        });
    });
    // /SECTION

    // SECTION: getOne()
    describe("Get one doctor", () => {
        // ANCHOR: should get sample doctor
        test("should get sample doctor", async () => {
            //* Arrange
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };

            //* Act
            const response = await doctorServices.getOne(_id);

            //* Assert
            expect(response).toEqual({ success: true, doctor });
        });

        // ANCHOR: should return error on unexisting doctor id
        test("should return error on unexisting doctor id", async () => {
            //* Arrange
            const id = "hiimdoctorid";

            //* Act
            const responce = await doctorServices.getOne(id);

            //* Assert
            expect(responce.success).toEqual(false);
            expect(responce.error).toEqual("no_doctor_found");
            expect(responce.message).toBeDefined();
        });
    });
    // /SECTION

    // SECTION
    describe("save become doctor request", () => {
        const sampleRequest: BecomeDoctorObj = DoctorObjToBecomeDoctorObj(
            sampleDoctor
        );

        // ANCHOR: should save sample doctor request
        test("should save sample doctor request", async () => {
            //* Act
            const response = await doctor_services.saveBecomeDoctorRequest(
                sampleRequest
            );

            //* Assert
            expect(response).toEqual({ success: true });
            const raw = await BecomeDoctorRequest.find({});
            const request = IBecomeDoctorToBecomeDoctorObj(raw[0]);

            expect(sampleRequest).toEqual(request);
        });

        // ANCHOR: should return error on exceeding the limit
        test("should return error on exceeding the limit", async () => {
            //* Arrange
            await BecomeDoctorRequest.create(sampleRequest);
            await BecomeDoctorRequest.create(sampleRequest);
            await BecomeDoctorRequest.create(sampleRequest);

            //* Act
            const response = await doctor_services.saveBecomeDoctorRequest(
                sampleRequest
            );

            //* Assert
            expect(response.success).toEqual(false);
            expect(response.error).toEqual("requests_limit_error");
            expect(response.message).toBeDefined();
            const raw = await BecomeDoctorRequest.find({});
            expect(raw.length).toEqual(3);
        });
    });
    // /SECTION
});
