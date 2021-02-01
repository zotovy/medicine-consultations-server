/// <reference types="../../node_modules/@types/jest/index" />


/**
 *  ? This test module testing balance services
 *
 *  Every test have similar structure consisting of 3 parts
 *  • Arrange  —— initializes objects and sets the value of data passed to the method for the test.
 *  • Act  —— calls a method for the test with the placed parameters.
 *  • Assert  —— checks that the method for the test works as expected.
 *
 *  The test module is considered passed if all test cases were passed correctly
 *  All test modules will run by `npm run test` after commiting to master. Changes will apply only if all tests were passed
 */

import mongoose from "mongoose";
import User from "../../models/user";
import Doctor from "../../models/doctor";
import TransactionModel from "../../models/transaction-model";
import { sampleUser, sampleTransaction } from "../helpers/data";

// testable
import BalanceServices from "../../services/balance_services";
import { IUser } from "../../types/models";
import { sampleDoctor } from "../routes/doctor.test";

describe("Test Balance Services", () => {
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
    });

    // Remove all date from mongodb after each test case
    afterEach(async () => {
        await User.remove({});
        await Doctor.remove({});
    });

    test("should get balance of sample user", async () => {
        //* Arrange
        const transaction = await TransactionModel.create(sampleTransaction);
        const { _id } = await User.create({ ...sampleUser, transactionHistory: [transaction._id] });

        //* Act
        const data = await BalanceServices.getBalance(_id, true);

        //* Assert
        expect(data.balance).toEqual(sampleUser.balance);
        const trs = await User.findById(_id).populate("transactionHistory").lean() as IUser;
        expect(data.history).toEqual([...trs.transactionHistory]);
    });

    test("should get balance of sample doctor", async () => {
        //* Arrange
        const transaction = await TransactionModel.create(sampleTransaction);
        const { _id } = await Doctor.create({ ...sampleDoctor, transactionHistory: [transaction._id] });

        //* Act
        const data = await BalanceServices.getBalance(_id, false);

        //* Assert
        expect(data.balance).toEqual(sampleDoctor.balance);
        const trs = await Doctor.findById(_id).populate("transactionHistory").lean() as IUser;
        expect(data.history).toEqual([...trs.transactionHistory]);
    });

    test("should throw no_user_found error", async () => {
        //* Arrange
        const transaction = await TransactionModel.create(sampleTransaction);
        await User.create({ ...sampleUser, transactionHistory: [transaction._id] });
        const id = "123456789101";

        //* Act
        const data = await BalanceServices.getBalance(id, true).catch(e => e);

        //* Assert
        expect(data).toEqual("no_user_found");
    });

    test("should throw no_doctor_found error", async () => {
        //* Arrange
        const transaction = await TransactionModel.create(sampleTransaction);
        await Doctor.create({ ...sampleDoctor, transactionHistory: [transaction._id] });
        const id = "123456789101";

        //* Act
        const data = await BalanceServices.getBalance(id, false).catch(e => e);

        //* Assert
        expect(data).toEqual("no_doctor_found");
    });

    test("should use this_month option", async () => {
        //* Arrange
        const now = new Date();
        const d1 = new Date(now.getFullYear(), now.getMonth() - 1, 20);
        const d2 = new Date(now.getFullYear(), now.getMonth() - 1,  13);
        const d3 = new Date(now.getFullYear(), now.getMonth() - 1,  6);
        const d4 = new Date(now.getFullYear(), now.getMonth() + 1,  19);
        const d5 = new Date(now.getFullYear(), now.getMonth() - 10,  12);

        const t1 = await TransactionModel.create({ ...sampleTransaction, date: d1 });
        const t2 = await TransactionModel.create({ ...sampleTransaction, date: d2 });
        const t3 = await TransactionModel.create({ ...sampleTransaction, date: d3 });
        const t4 = await TransactionModel.create({ ...sampleTransaction, date: d4 });
        const t5 = await TransactionModel.create({ ...sampleTransaction, date: d5 });

        const { _id } = await User.create({ ...sampleUser, transactionHistory: [
            t1._id,
            t2._id,
            t3._id,
            t4._id,
            t5._id,
            ] });

        //* Act
        const data = await BalanceServices.getBalance(_id, true, { period: "this_month" });

        //* Assert
        // expect(await User.findById(_id)).toEqual(3);
        expect(data.history.length).toEqual(3);
        let queried = [
            await TransactionModel.findById(t1._id).lean(),
            await TransactionModel.findById(t2._id).lean(),
            await TransactionModel.findById(t3._id).lean(),
        ]
        data.history.forEach(e => {
            expect(queried).toContainEqual(e);
        })
    });

    test("should use this_week option", async () => {
        //* Arrange
        const now = new Date();
        const d1 = new Date();
        const d2 = new Date();
        const d3 = new Date(now.getFullYear(), now.getMonth() - 1,  now.getDay() + 7);
        const d4 = new Date(now.getFullYear(), now.getMonth() - 1,  now.getDay() + 11);
        const d5 = new Date(now.getFullYear(), now.getMonth() - 10,  now.getDay() + 2);

        const t1 = await TransactionModel.create({ ...sampleTransaction, date: d1 });
        const t2 = await TransactionModel.create({ ...sampleTransaction, date: d2 });
        const t3 = await TransactionModel.create({ ...sampleTransaction, date: d3 });
        const t4 = await TransactionModel.create({ ...sampleTransaction, date: d4 });
        const t5 = await TransactionModel.create({ ...sampleTransaction, date: d5 });

        const { _id } = await User.create({ ...sampleUser, transactionHistory: [
                t1._id,
                t2._id,
                t3._id,
                t4._id,
                t5._id,
            ] });

        //* Act
        const data = await BalanceServices.getBalance(_id, true, { period: "this_week" });

        //* Assert
        expect(data.history.length).toEqual(2);
        let queried = [
            await TransactionModel.findById(t1._id).lean(),
            await TransactionModel.findById(t2._id).lean(),
        ]
        data.history.forEach(e => {
            expect(queried).toContainEqual(e);
        })
    });

    test("should use this_year option", async () => {
        //* Arrange
        const now = new Date();
        const d1 = new Date(now.getFullYear(), 1, 20);
        const d2 = new Date(now.getFullYear(), 11,  13);
        const d3 = new Date(now.getFullYear(), 7,   7);
        const d4 = new Date(now.getFullYear() + 1, 1, 3);
        const d5 = new Date(now.getFullYear() - 10, 3, 5);

        const t1 = await TransactionModel.create({ ...sampleTransaction, date: d1 });
        const t2 = await TransactionModel.create({ ...sampleTransaction, date: d2 });
        const t3 = await TransactionModel.create({ ...sampleTransaction, date: d3 });
        const t4 = await TransactionModel.create({ ...sampleTransaction, date: d4 });
        const t5 = await TransactionModel.create({ ...sampleTransaction, date: d5 });

        const { _id } = await User.create({ ...sampleUser, transactionHistory: [
                t1._id,
                t2._id,
                t3._id,
                t4._id,
                t5._id,
            ] });

        //* Act
        const data = await BalanceServices.getBalance(_id, true, { period: "this_year" });

        //* Assert
        expect(data.history.length).toEqual(3);
        let queried = [
            await TransactionModel.findById(t1._id).lean(),
            await TransactionModel.findById(t2._id).lean(),
            await TransactionModel.findById(t3._id).lean(),
        ]
        data.history.forEach(e => {
            expect(queried).toContainEqual(e);
        })
    });

    test("should use x_year option", async () => {
        //* Arrange
        const now = new Date();
        const d1 = new Date(2011, 1, 20);
        const d2 = new Date(2011, 11,  13);
        const d3 = new Date(2011, 7,   7);
        const d4 = new Date(now.getFullYear() + 1, 1, 3);
        const d5 = new Date(now.getFullYear() - 1, 3, 5);

        const t1 = await TransactionModel.create({ ...sampleTransaction, date: d1 });
        const t2 = await TransactionModel.create({ ...sampleTransaction, date: d2 });
        const t3 = await TransactionModel.create({ ...sampleTransaction, date: d3 });
        const t4 = await TransactionModel.create({ ...sampleTransaction, date: d4 });
        const t5 = await TransactionModel.create({ ...sampleTransaction, date: d5 });

        const { _id } = await User.create({ ...sampleUser, transactionHistory: [
                t1._id,
                t2._id,
                t3._id,
                t4._id,
                t5._id,
            ] });

        //* Act
        const data = await BalanceServices.getBalance(_id, true, { period: "x_year", periodPayload: 2011 });

        //* Assert
        let queried = [
            await TransactionModel.findById(t1._id).lean(),
            await TransactionModel.findById(t2._id).lean(),
            await TransactionModel.findById(t3._id).lean(),
        ]
        data.history.forEach(e => {
            expect(queried).toContainEqual(e);
        })
        expect(data.history.length).toEqual(3);
    });

    test("should use x_month option", async () => {
        //* Arrange
        const now = new Date();
        const d1 = new Date(now.getFullYear(), 2, 20);
        const d2 = new Date(now.getFullYear(), 2,  13);
        const d3 = new Date(now.getFullYear(), 2,   7);
        const d4 = new Date(now.getFullYear(), 1, 3);
        const d5 = new Date(now.getFullYear(), 6, 5);

        const t1 = await TransactionModel.create({ ...sampleTransaction, date: d1 });
        const t2 = await TransactionModel.create({ ...sampleTransaction, date: d2 });
        const t3 = await TransactionModel.create({ ...sampleTransaction, date: d3 });
        const t4 = await TransactionModel.create({ ...sampleTransaction, date: d4 });
        const t5 = await TransactionModel.create({ ...sampleTransaction, date: d5 });

        const { _id } = await User.create({ ...sampleUser, transactionHistory: [
                t1._id,
                t2._id,
                t3._id,
                t4._id,
                t5._id,
            ] });

        //* Act
        const data = await BalanceServices.getBalance(_id, true, { period: "x_month", periodPayload: 3 });

        //* Assert
        let queried = [
            await TransactionModel.findById(t1._id).lean(),
            await TransactionModel.findById(t2._id).lean(),
            await TransactionModel.findById(t3._id).lean(),
        ]
        data.history.forEach(e => {
            expect(queried).toContainEqual(e);
        })
        expect(data.history.length).toEqual(3);
    });

})