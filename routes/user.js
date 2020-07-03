const express = require("express");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const UserServices = require("../services/user_services");
const RefreshToken = require("../models/token");
const { db } = require("../models/token");

const jwtAccessToken = process.env.jwt_access;
const jwtRefreshToken = process.env.jwt_refresh;

const Router = express.Router();
const userServices = new UserServices();

// User Profile image storage
const storage = multer.diskStorage({
    destination: (req, file, callback) =>
        callback(null, "./static/user-profiles"),
    filename: (req, file, callback) => {
        let customFileName = crypto.randomBytes(18).toString("hex");
        let fileExtension = path.extname(file.originalname).split(".")[1];
        console.log(`${customFileName}.${fileExtension}`);
        callback(null, `${customFileName}.${fileExtension}`);
    },
});

// User Profile image filter
const fileFilter = (req, file, callback) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/jpg"
    ) {
        callback(null, true);
    } else {
        callback(null, false);
    }
};

// Upload user profiles
const upload = multer({
    storage,
    limits: {
        fileSize: 7340032,
    },
    fileFilter,
});

// ANCHOR: generate token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
        },
        jwtAccessToken,
        {
            expiresIn: "30m",
        }
    );
};

// ANCHOR: authenticate token
const authenticateToken = (req, res, next) => {
    const header = req.headers.auth;

    if (!header) {
        return res.status(401).json({
            success: false,
            error: "not_authorize",
            message:
                "User must be authorize to go to this page but no token was found",
        });
    }

    // header example:
    // auth: "Bearer ds8f9a0udfd9safjdsafu9fuads9f0uasfd9fus9dfduds9fua9sdc"

    const splitted = header.split(" ");
    console.log(splitted);
    const token = splitted.length > 1 ? splitted[1] : undefined;

    if (!token) {
        return res.status(401).json({
            success: false,
            error: "not_authorize",
            message:
                "User must be authorize to go to this page but no token was found",
        });
    }

    jwt.verify(token, jwtAccessToken, (err, userId) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: "invalid_token",
                message: "Some token was passed but it's invalid token",
            });
        }

        // Set valid authorize user id
        req.userId = userId;

        next();
    });
};

Router.post("/generate-token", async (req, res) => {
    const id = req.body ? req.body.id : null;

    if (!id) {
        return res.status(412).json({
            success: false,
            error: "empty_body",
            message: "No id found in body",
        });
    }

    const accessToken = jwt.sign({ id }, jwtAccessToken);
    const refreshToken = jwt.sign({ id }, jwtAccessToken);

    return res.status(200).json({
        success: true,
        tokens: {
            access: accessToken,
            refresh: refreshToken,
        },
    });
});

Router.post("/login-user", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        return res.status(412).json({
            success: false,
            error: "empty_body",
            message: "No email or password found in body",
        });
    }

    const dbcode = await userServices.checkUser(email, password);

    if (!dbcode.success) {
        return res.status(500).json({
            success: false,
            error: dbcode.error,
            message: dbcode.message,
        });
    }

    return res.status(200).json({
        success: true,
        id: dbcode.id,
    });
});

// ANCHOR: Refresh token
Router.post("/token", async (req, res) => {
    const token = req.body ? req.body.token : undefined;

    if (!token) {
        return res.status(412).json({
            success: false,
            error: "empty_body",
            message: "No token found in body",
        });
    }

    // Is given refresh token in valid token's base
    const founded = await RefreshToken.find({
        value: token,
    });

    if (!founded) {
        return res.status(400).json({
            success: false,
            error: "invalid_token",
            message: "Invalid token were given",
        });
    }

    // Verify token
    jwt.verify(token, jwtRefreshToken, async (err, userId) => {
        if (err) {
            return res.status(400).json({
                success: false,
                error: "invalid_token",
                message: "Token didn't verified",
            });
        }

        const newAccessToken = generateToken(userId);

        const newRefreshToken = jwt.sign(
            {
                id: userId,
            },
            jwtRefreshToken
        );

        await RefreshToken.findOneAndUpdate(
            { value: newRefreshToken },
            (err) => {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        error: "invalid_token",
                        message: "Token doesn't match any user",
                    });
                }
            }
        );

        return res.status(201).json({
            success: true,
            tokens: {
                access: newAccessToken,
                refresh: newRefreshToken,
            },
        });
    });
});

// ANCHOR: Get all users
Router.get("/users", async (req, res) => {
    try {
        // get users
        const dbcode = await userServices.getUsers();

        // check users
        if (!dbcode.success) {
            return res.status(412).json({
                success: false,
                error: dbcode.error,
                message: dbcode.message,
            });
        }

        return res.status(200).json({
            success: true,
            users: dbcode.users,
        });
    } catch (e) {
        return res.status(500).json({
            success: false,
            error: "invalid_error",
            message: e,
        });
    }
});

// ANCHOR: get user
Router.get("/user/:id", async (req, res, next) => {
    // Get id from params
    const id = req.params.id;

    // Check id
    if (!id) {
        return res.status(412).json({
            success: false,
            error: "empty_params",
            message: "Id is required param but no id found",
        });
    }

    try {
        // get user
        const dbcode = await userServices.getUserById(id);

        // check user
        if (!dbcode.success) {
            return res.status(404).json({
                success: false,
                error: dbcode.error,
                message: dbcode.message,
            });
        }

        // return user
        return res.status(200).json({
            success: true,
            user: dbcode.user,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            error: "invalid_error",
            message: e,
        });
    }
});

// // ANCHOR: logout
// Router.delete("/logout", async (req, res) => {
//   const token = req.body ? req.body.token : undefined;

//   if (!token) {
//     return res.status(412).json({
//       success: false,
//       error: "empty_body",
//       message: "No token found in body",
//     });
//   }

//   try {
//     await RefreshToken.findOneAndDelete(
//       {
//         value: token,
//       },
//       (err, token) => {
//         if (err) {
//           return res.status(500).json({
//             success: false,
//             error: "invalid_error",
//             message: err,
//           });
//         }

//         return res.status(200).json({
//           success: true,
//           token: token,
//         });
//       }
//     );
//   } catch (e) {
//     console.log(e);
//     return res.status(500).json({
//       success: false,
//       error: "invalid_error",
//       message: e,
//     });
//   }
// });

// ANCHOR: set user avatar
Router.post("/user/setAvatar", upload.single("photoUrl"), async (req, res) => {
    // Get body
    const body = req.body;

    if (!body) {
        return {
            success: false,
            error: "empty_body",
            message: "No body provides",
        };
    }

    // Get user avatar
    const userId = body.userId;

    console.log(userId);

    if (!userId) {
        return res.status(412).json({
            success: false,
            error: "empty_body",
            message: "No userId found in body",
        });
    }

    // Get photo url
    const photoUrl = "http://localhost:5000/" + req.file.path;

    if (!userId) {
        return res.status(412).json({
            success: false,
            error: "empty_body",
            message: "No photoUrl found in body",
        });
    }

    try {
        const dbcode = await userServices.setUserAvatar(userId, photoUrl);

        if (!dbcode.success) {
            return res.status(500).json({
                success: false,
                error: dbcode.error,
                message: dbcode.message,
            });
        }

        return res.status(201).json({
            success: true,
            user: dbcode.newUser,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            error: "invalid_error",
            message: e,
        });
    }
});

// ANCHOR: Create
Router.post("/user", async (req, res) => {
    // Get user from request body
    const user = req.body;

    if (!user) {
        console.log("body is null");
        return res.status(412).json({
            success: false,
            error: "empty_body",
            message: "No user found in body",
        });
    }

    // Validate user
    const isValidated = await userServices.validateUser(user);

    if (!isValidated.success) {
        console.log("user is not validated");
        return res.json({
            success: false,
            error: isValidated.error,
            message: "User is not validated",
        });
    }

    try {
        // Create user
        const dbcode = await userServices.createUser(user);

        // Check created user
        if (!dbcode.success) {
            return res.status(500).json({
                success: false,
                error: dbcode.error,
                message: dbcode.message,
            });
        }

        // generate access token
        const accessToken = generateToken(dbcode.user);

        // generate refresh token
        const refreshToken = jwt.sign(
            {
                id: dbcode.user.id,
            },
            jwtRefreshToken
        );

        // push refresh token to db
        await RefreshToken.create({
            value: refreshToken,
        });

        return res.status(201).json({
            success: true,
            user: dbcode.user,
            tokens: {
                access: accessToken,
                refresh: refreshToken,
            },
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            error: "invalid_error",
            message: e,
        });
    }
});

// ANCHOR: Update user
Router.put("/user/:id", async (req, res, next) => {
    // Get user id from params
    const id = req.params.id;

    // Check user id
    if (!id) {
        return res.status(412).json({
            success: false,
            error: "empty_params",
            message: "User is required param but no id found",
        });
    }

    // Get new user from request body
    const newUser = req.body;

    // Check new user
    if (!newUser) {
        return res.status(412).json({
            success: false,
            error: "empty_body",
            message: "User is required body but no newUser found",
        });
    }

    const isValidated = await userServices.validateUser(newUser, false);

    if (!isValidated.success) {
        return res.status(412).json({
            success: false,
            error: {
                code: "not_validated",
                ...isValidated.error,
            },
            message: "User is not validated",
        });
    }

    try {
        const dbcode = await userServices.updateUser(newUser);

        // check action
        if (!dbcode.success) {
            return res.status(500).json({
                success: false,
                error: dbcode.error,
                message: dbcode.message,
            });
        }

        return res.status(200).json({
            success: true,
            user: dbcode.user,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            error: "invalid_error",
            message: e,
        });
    }
});

// ANCHOR: delete user
Router.delete("/user/:id", async (req, res, next) => {
    // get id from param
    const id = req.params.id;

    // check given id
    if (!id) {
        return res.status(412).json({
            success: false,
            error: "empty_params",
            message: "User is required params but no id found",
        });
    }

    try {
        const dbcode = await userServices.deleteUser(id);

        // check action
        if (!dbcode.success) {
            return res.status(500).json({
                success: false,
                error: dbcode.error,
                message: dbcode.message,
            });
        }

        return res.status(200).json({
            success: true,
            user: dbcode.user,
        });
    } catch (e) {
        return res.status(500).json({
            success: false,
            error: "invalid_error",
            message: e,
        });
    }
});

module.exports = Router;
