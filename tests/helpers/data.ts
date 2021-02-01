import {
    DoctorObject,
    ITransaction,
    PaymentMethod,
    TransactionDirection,
    TransactionStatus,
    TransactionType,
    UserObject
} from "../../types/models";
import { EWorkPlan } from "../../types/services";

export const sampleTransaction: ITransaction = {
    amount: 50,
    bankDetails: "4440 1234 1234 1234",
    date: new Date(),
    direction: TransactionDirection.top_up,
    paymentMethod: PaymentMethod.bank_card,
    status: TransactionStatus.succeeded,
    transactionType: TransactionType.bank_card
}

export const sampleUser: UserObject = {
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
    favourites: [], // will add later
    fullName: "Иванов Иван Иванович",
    activeConsultations: [],
    balance: 100,
    consultationRequests: [],
    chatsWithHelpers: [],
    age: 25,
    birthday: new Date(1997, 10, 24),
    transactionHistory: [],
    schedule: [],
};

const sampleDoctor: DoctorObject = {
    id: undefined,
    name: "Иван",
    surname: "Иванов",
    patronymic: "Иванович",
    photoUrl: "",
    phone: 79028319028,
    email: "ivanov_ivan@mail.ru",
    password: "12345678",
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
    _education: "МГУ",
    issueDate: "21.11.2015",
    yearEducation: "2010 - 2015",
    beginDoctorDate: new Date(),
    activeConsultations: [], // will add later
    experience: 364,
    favourites: [], // will add later
    rating: 4.6,
    schedule: [], // will add later
    speciality: ["Pediatrician", "Nutritionist"],
    whosFavourite: [], // will add later
    passportIssueDate: "21.11.2015",
    passportIssuedByWhom: "МВД г. Москвы",
    passportSeries: "123123",
    _workExperience: "1 год",
    _workPlaces: "Городская поликлиника №1 г. Москва",
    age: 35,
    isAdult: true,
    isChild: false,
    workPlan: EWorkPlan.Multiple,
    serviceExperience: 360,
    qualification: "first",
    fullName: "Иванов Иван Иванович",
    workingTime: {
        from: { h: 9, m: 0 },
        to: { h: 18, m: 0 },
        weekends: [5, 6],
        consultationTimeInMin: 60,
        consultationPauseInMin: 10,
    },
    qualificationProofs: [],
    workPlaces: [],
    information: "Cool guy :)",
    education: [],
    birthday: new Date(),
    consultationRequests: [],
    price: 700,
    transactionHistory: [],
    balance: 100,
    chatsWithHelpers: [],
};
