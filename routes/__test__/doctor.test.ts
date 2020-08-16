/// <reference types="../../node_modules/@types/jest/index" />

import supertest from "supertest";
import mongoose from "mongoose";
import Doctor, { BecomeDoctorRequest } from "../../models/doctor";
import app, { server } from "../../server";

// Testable
import doctorServices from "../../services/doctor_services";

// @types
import { DoctorObject, BecomeDoctorObj } from "../../types/models";
import {
    IDoctorToDoctorObj,
    DoctorObjToBecomeDoctorObj,
} from "../../services/types_services";
import { EWorkPlan } from "../../types/services";
import doctor from "../../models/doctor";

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

// Fix @types
declare function done(): any;

// Used to simulate http requests
const request = supertest(app);

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
    issueDate: "12.11.2015",
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
    age: 19,
    isAdult: false,
    isChild: true,
    workPlan: EWorkPlan.Multiple,
    serviceExperience: 365,
};

const sampleBecomeDoctorRequest: BecomeDoctorObj = DoctorObjToBecomeDoctorObj(
    sampleDoctor
);

// This function will convert lastActiveAt, createdAt & beginDoctorDate
// from String --> Date and return new doctorObj
const convertDoctorFields = (doctor: any) => {
    if (doctor.lastActiveAt && doctor.createdAt && doctor.beginDoctorDate) {
        // Convert String --> new Date
        doctor.lastActiveAt = new Date(doctor.lastActiveAt);
        doctor.createdAt = new Date(doctor.createdAt);
        doctor.beginDoctorDate = new Date(doctor.beginDoctorDate);
    }
    return doctor;
};

describe("Test Doctor API", () => {
    let db: mongoose.Mongoose;

    // It's just so easy to connect to the MongoDB Memory Server
    // By using mongoose.connect
    beforeAll(async () => {
        db = await mongoose.connect(
            "mongodb://localhost/test",
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
        db.connection.dropDatabase();
        server?.close();
        done();
    });

    // Remove all date from mongodb after each test case
    afterEach(async () => {
        await Doctor.remove({});
        await BecomeDoctorRequest.remove({});
    });

    // SECTION: POST /doctor
    describe("POST /doctor", () => {
        // ANCHOR: should create sample doctor
        test("should create sample doctor", async (done) => {
            //* Arrange
            const doctor = sampleDoctor;

            //* Act
            const response = await request
                .post("/api/doctor")
                .type("json")
                .send(sampleDoctor);
            const status = response.status;
            const data = JSON.parse(response.text);

            //*  Assert
            doctor.id = data.uid;
            expect(data).toEqual({ success: true, uid: data.uid });
            expect(status).toEqual(201);

            const newDoctor = await doctorServices.getOne(doctor.id);
            expect(newDoctor.doctor).toEqual(doctor);

            done();
        });

        // ANCHOR: should return error on not validated user
        test("should return error on not validated user", async (done) => {
            //* Act
            const response = await request
                .post("/api/doctor")
                .type("json")
                .send({});
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(status).toEqual(400);
            expect(data.success).toEqual(false);
            expect(data.uid).toBeFalsy();
            expect(data.error).toEqual("not_validated_error");
            expect(Object.keys(data.validationErrors).length).toEqual(14);
            expect(data.message).toBeTruthy();

            const users = await Doctor.find({});
            expect(users).toEqual([]);

            done();
        });
    });
    // /SECTION

    // SECTION: PUT /doctor
    describe("PUT /doctor", () => {
        // ANCHOR: should update sample doctor
        test("should update sample doctor", async (done) => {
            //* Arrange
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id), name: "Максим" };

            //* Act
            const response = await request
                .put("/api/doctor")
                .type("json")
                .send(doctor);
            const status = response.status;
            const data = JSON.parse(response.text);
            data.doctor = convertDoctorFields(data.doctor);

            //* Assert
            expect(data).toEqual({ success: true, doctor });
            expect(status).toEqual(202);

            const updated = await doctorServices.getOne(String(_id));
            expect(updated.doctor).toEqual(doctor);

            done();
        });

        // ANCHOR: shouldn't update doctor with errors
        test("shouldn't update doctor with errors", async (done) => {
            //* Act
            const response = await request
                .put("/api/doctor")
                .type("json")
                .send({});
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(data.success).toEqual(false);
            expect(data.doctor).toBeFalsy();
            expect(data.error).toEqual("not_validated_error");
            expect(Object.keys(data.validationErrors).length).toEqual(14);
            expect(data.message).toBeTruthy();

            const users = await Doctor.find({});
            expect(users).toEqual([]);

            done();
        });

        // ANCHOR: shouldn't update not existing doctor
        test("shouldn't update not existing doctor", async (done) => {
            //* Arrange
            const id = "imfakeuserid";

            //* Act
            const response = await request
                .put("/api/doctor")
                .type("json")
                .send({ ...sampleDoctor, id: id });
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(data.error).toEqual("updated_doctor_is_null");
            expect(data.success).toEqual(false);
            expect(data.message).toBeTruthy();
            expect(status).toEqual(400);

            done();
        });
    });
    // /SECTION

    // SECTION: DELETE /doctor
    describe("DELETE /doctor", () => {
        // ANCHOR: should delete sample doctor
        test("should delete sample doctor", async (done) => {
            //* Arrange
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };

            //* Act
            const response = await request.delete(`/api/doctor/${_id}`);
            const status = response.status;
            const data = JSON.parse(response.text);
            data.doctor = convertDoctorFields(data.doctor);

            //* Assert
            expect(status).toEqual(203);
            expect(data).toEqual({ success: true, doctor });

            const doctors = await Doctor.find({});
            expect(doctors).toEqual([]);

            done();
        });

        // ANCHOR: should return error on not existing doctor
        test("should return error on not existing doctor", async (done) => {
            //* Arrange
            const id = "hiimdoctorid";

            //* Act
            const response = await request.delete(`/api/doctor/${id}`);
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(status).toEqual(400);
            expect(data.success).toEqual(false);
            expect(data.error).toEqual("no_doctor_found");
            expect(data.message).toBeDefined();

            done();
        });
    });
    // /SECTION

    // SECTION: GET /doctors
    describe("GET /doctors", () => {
        // ANCHOR: should get 3 doctors
        test("should get 3 doctors", async (done) => {
            //* Arrange
            const doc1 = await Doctor.create(sampleDoctor);
            const doc2 = await Doctor.create({
                ...sampleDoctor,
                email: "1@mail.com",
                notificationEmail: "1@mail.com",
            });
            const doc3 = await Doctor.create({
                ...sampleDoctor,
                email: "2@mail.com",
                notificationEmail: "2@mail.com",
            });
            const doctor1 = { ...sampleDoctor, id: String(doc1._id) };
            const doctor2 = {
                ...sampleDoctor,
                id: String(doc2._id),
                email: "1@mail.com",
                notificationEmail: "1@mail.com",
            };
            const doctor3 = {
                ...sampleDoctor,
                id: String(doc3._id),
                email: "2@mail.com",
                notificationEmail: "2@mail.com",
            };

            //* Act
            const response = await request.get(`/api/doctors`);
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(status).toEqual(200);
            expect(
                data.doctors.map((e: any) => convertDoctorFields(e))
            ).toEqual([doctor1, doctor2, doctor3]);
            expect(data.success).toEqual(true);

            done();
        });

        // ANCHOR: should use filter
        test("should use filter", async (done) => {
            //* Arrange
            await Doctor.create(sampleDoctor);
            await Doctor.create({
                ...sampleDoctor,
                email: "2@mail.com",
                notificationEmail: "2@mail.com",
            });
            const { _id } = await Doctor.create({
                ...sampleDoctor,
                email: "1@mail.com",
                notificationEmail: "1@mail.com",
                speciality: ["Logopedist"],
                experience: 100,
                rating: 3.1,
                city: "Новосибирск",
                workPlan: EWorkPlan.Multiple,
                isChild: true,
                isAdult: false,
            });

            const doctor = {
                ...sampleDoctor,
                id: String(_id),
                email: "1@mail.com",
                notificationEmail: "1@mail.com",
                speciality: ["Logopedist"],
                experience: 100,
                rating: 3.1,
                city: "Новосибирск",
                workPlan: EWorkPlan.Multiple,
                isChild: true,
                isAdult: false,
            };

            const filter = {
                speciality: ["Logopedist"],
                experience: ["LessYear"],
                rating: [3],
                city: ["Новосибирск"],
                workPlan: ["Multiple"],
                isChild: true,
                isAdult: false,
            };

            //* Act
            const response = await request
                .get(`/api/doctors`)
                .type("json")
                .send({
                    filter,
                });
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(status).toEqual(200);
            expect(
                data.doctors.map((e: any) => convertDoctorFields(e))
            ).toEqual([doctor]);
            expect(data.success).toEqual(true);

            done();
        });

        // ANCHOR: should use from & amount queries
        test("should use from & amount queries", async (done) => {
            //* Arrange
            await Doctor.create(sampleDoctor);
            const { _id } = await Doctor.create({
                ...sampleDoctor,
                email: "1@mail.com",
                notificationEmail: "1@mail.com",
            });
            await Doctor.create({
                ...sampleDoctor,
                email: "2@mail.com",
                notificationEmail: "2@mail.com",
            });
            const doctor = {
                ...sampleDoctor,
                id: String(_id),
                email: "1@mail.com",
                notificationEmail: "1@mail.com",
            };

            //* Act
            const response = await request.get(`/api/doctors?from=1&amount=1`);
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(status).toEqual(200);
            expect(
                data.doctors.map((e: any) => convertDoctorFields(e))
            ).toEqual([doctor]);
            expect(data.success).toEqual(true);

            done();
        });
    });
    // /SECTION

    // SECTION: GET /doctor/:id
    describe("GET /doctor/:id", () => {
        // ANCHOR: should get sample doctor
        test("should get sample doctor", async () => {
            //* Arrange
            const { _id } = await Doctor.create(sampleDoctor);
            const doctor = { ...sampleDoctor, id: String(_id) };

            //* Act
            const response = await request.get(`/api/doctor/${_id}`);
            const status = response.status;
            const data = JSON.parse(response.text);
            data.doctor = convertDoctorFields(data.doctor);

            //* Assert
            expect(status).toEqual(200);
            expect(data).toEqual({ success: true, doctor });
        });

        // ANCHOR: should return error on unexisting doctor id
        test("should return error on unexisting doctor id", async () => {
            //* Arrange
            const id = "hiimdoctorid";

            //* Act
            const response = await request.get(`/api/doctor/${id}`);
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(status).toEqual(400);
            expect(data.success).toEqual(false);
            expect(data.error).toEqual("no_doctor_found");
            expect(data.message).toBeDefined();
        });
    });
    // /SECTION

    // SECTION: POST /doctor-request/send
    describe("POST /doctor-request/send", () => {
        // ANCHOR: should save sample request
        test("should save sample request", async (done) => {
            //* Act
            const response = await request
                .post(`/api/doctor-request/send`)
                .type("json")
                .send(sampleBecomeDoctorRequest);
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(status).toEqual(201);
            expect(data).toEqual({ success: true });

            done();
        });

        // ANCHOR: should return error on exceeding the limit
        test("should return error on exceeding the limit", async () => {
            //* Arrange
            await BecomeDoctorRequest.create(sampleBecomeDoctorRequest);
            await BecomeDoctorRequest.create(sampleBecomeDoctorRequest);
            await BecomeDoctorRequest.create(sampleBecomeDoctorRequest);

            //* Act
            const response = await request
                .post(`/api/doctor-request/send`)
                .type("json")
                .send(sampleBecomeDoctorRequest);
            const status = response.status;
            const data = JSON.parse(response.text);

            //* Assert
            expect(status).toEqual(400);
            expect(data.success).toEqual(false);
            expect(data.error).toEqual("requests_limit_error");
            expect(data.message).toBeDefined();
            const raw = await BecomeDoctorRequest.find({});
            expect(raw.length).toEqual(3);
        });
    });
    // /SECTION
});
