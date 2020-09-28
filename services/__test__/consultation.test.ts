/// <reference types="../../node_modules/@types/jest/index" />
import mongoose from "mongoose";
import { ConsultationObject } from "../../types/models";
import setupModels from "../../models";
import Consultation from "../../models/consultation";
import consultation_services from "../consultation_services";

/**
 *  ? This test module testing consultation services
 *
 *  Every test have similar structure consisting of 3 parts
 *  • Arrange  —— initializes objects and sets the value of data passed to the method for the test.
 *  • Act  —— calls a method for the test with the placed parameters.
 *  • Assert  —— checks that the method for the test works as expected.
 *
 *  The test module is considered passed if all test cases were passed correctly
 *  All test modules will run by `npm run test` after commiting to master. Changes will apply only if all tests were passed
 */

const sampleConsultation: ConsultationObject = {
    date: new Date(),
    doctorId: "5f479fbe84148e0918c320e7",
    patientId: "5f479fbe84148e0918c320e8",
    note: "This is a note",
};

setupModels();

describe("Test Consultation services", () => {
    let db: mongoose.Mongoose;

    // It's just so easy to connect to the MongoDB Memory Server
    // By using mongoose.connect
    beforeAll(async () => {
        db = await mongoose.connect(
            "mongodb://localhost/test-db",
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
        await Consultation.deleteMany({});
    });

    describe("create()", () => {
        test("should create sample consultation", async () => {
            //* Act
            const id = await consultation_services.create(sampleConsultation);

            //* Assert
            expect(typeof id).toEqual("string");
            const { _id } = (await Consultation.find({}))[0];
            expect(id).toEqual(String(_id));
        });

        test("shoud use validation", async () => {
            //* Arrange
            const errors = [
                "patientId_pattern_error",
                "doctorId_pattern_error",
                "date_format_error",
                "note_maxLength_error",
            ];

            const data = {
                patientId: "123",
                doctorId: "123",
                date: "123",
                note: "1".repeat(2057),
            };

            //* Act
            const id = await consultation_services.create(data).catch((e) => e);

            //* Assert
            expect(Array.isArray(id)).toEqual(true);
            expect(id).toEqual(errors);
            const cons = await Consultation.find({});
            expect(cons).toEqual([]);
        });
    });
});
