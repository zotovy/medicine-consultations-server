const express = require('express');
const UserRouter = require('./user');

const Router = express.Router();

Router.use("/", UserRouter);

module.exports = Router;