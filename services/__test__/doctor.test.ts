/// <reference types="../../node_modules/@types/jest/index" />

import mongoose from "mongoose";
import Doctor from "../../models/doctor";

// Testable
import doctorServices from "../doctor_services";

// @types
import { DoctorObject } from "../../types/models";
import { IDoctorToDoctorObj } from "../types_services";

/**
 *  ? This test module testing user services
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
    beginDoctorDate: new Date(),
    clientsConsultations: [], // will add later
    clientsReviews: [], // will add later
    experience: 3 * 365,
    favourites: [], // will add later
    rating: 4.6,
    sheldure: [], // will add later
    speciality: [],
    whosFavourite: [], // will add later
};

describe("Test UserServices", () => {
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
            //* Act
            const responce = await doctorServices.create(sampleDoctor);

            //* Assert
            expect(responce.success).toEqual(true);
            expect({ ...responce.user, id: undefined }).toEqual(sampleDoctor);
            expect(responce.error).toBeFalsy();
            expect(responce.errors).toBeFalsy();
            expect(responce.message).toBeFalsy();
        });
    });
    // /SECTION
});
