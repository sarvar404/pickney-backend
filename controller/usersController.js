import mongoose from "mongoose";
import movieSchm from "../model/movieSchema.js";
import { compareAsc, format, parseISO } from "date-fns";

import { v4 as uuidv4 } from "uuid";

import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

export const registration = async (request, response) => {
  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(request.body.password, saltRounds);

    const subscriptionStart = new Date(request.body.subscriptionStart);
    const subscriptionEnd = new Date(request.body.subscriptionEnd);

    if (subscriptionEnd <= subscriptionStart) {
      return response.status(400).json({ error: "Invalid subscription dates" });
    }

    const userData = {
      fname: request.body.fname,
      lname: request.body.lname,
      email: request.body.email,
      createdById: request.body.createdById,
      createdByEmail: request.body.createdByEmail,
      createdBy: request.body.createdBy,
      subscriptionStart: request.body.subscriptionStart,
      subscriptionEnd: request.body.subscriptionEnd,
      pin: request.body.pin,
      password: request.body.password, // Store the original password
      passwordHash: passwordHash, // Store the hashed password
      enable: true,
    };

    const savedUser = await usersSchm.create(userData);

    response.status(201).json({
      success: true,
      message: "User registration successful",
      id: savedUser._id, // Assuming _id is the field name for the user ID
    });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
};

// export const login = async (request, response) => {
//   try {
//     const { email, password } = request.body;

//     // Check if the email exists in a case-insensitive manner
//     const user = await usersSchm.findOne({
//       email: { $regex: new RegExp(`^${email}$`, "i") },
//     });

//     if (!user) {
//       throw new Error("Invalid user & password");
//     }

//     // Verify the provided password against the stored hash
//     const passwordMatch = await bcrypt.compare(password, user.passwordHash);

//     if (!passwordMatch) {
//       throw new Error("Invalid user & password");
//     }

//     if (!user.enable) {
//       throw new Error("User is not enabled. Please contact support.");
//     }

//     const subscriptionStart = parseISO(user.subscriptionStart);
//     const currentDate = new Date();

//     // console.log(subscriptionStart);
//     // console.log(currentDate);

//     const months = [
//       "January",
//       "February",
//       "March",
//       "April",
//       "May",
//       "June",
//       "July",
//       "August",
//       "September",
//       "October",
//       "November",
//       "December",
//     ];

//     const year = subscriptionStart.getFullYear();
//     const month = subscriptionStart.getMonth() + 1; // Note: Months are zero-indexed, so add 1 to get the correct month
//     const monthString = months[subscriptionStart.getMonth()];
//     const day = subscriptionStart.getDate();

//     if (subscriptionStart > currentDate) {
//       throw new Error(
//         `Subscription does not started yet. Please wait upto ${day} of ${monthString}.`
//       );
//     }

//     // if (compareAsc(subscriptionEndDate, currentDate) < 0) {
//     //   // Subscription is over
//     //   throw new Error("Subscription is over. Please renew your subscription.");
//     // }

//     let refreshTokenDocument = await refreshTokenSchema.findOne({
//       userId: user._id,
//     });

//     if (!refreshTokenDocument) {
//       // If a refreshToken document does not exist, generate new token and refreshToken
//       const token = setUser(user);
//       const refreshTokenPayload = {
//         userId: user._id,
//         email: user.email,
//       };
//       const refreshToken = jwt.sign(refreshTokenPayload, SECRET_KEY);

//       // Save the new refreshToken in the refreshTokenSchema
//       refreshTokenDocument = new refreshTokenSchema({
//         userId: user._id,
//         refreshToken: refreshToken,
//         token: token,
//       });
//       await refreshTokenDocument.save();
//     }

//     // Generate refresh token
//     response.cookie("token", refreshTokenDocument.token);
//     response.cookie("refreshToken", refreshTokenDocument.refreshToken);
//     response.status(200).json({
//       success: true,
//       message: "You have successfully logged in",
//       token: refreshTokenDocument.token,
//       refreshToken: refreshTokenDocument.refreshToken,
//       _id: user._id,
//       username: user.fname + " " + user.lname,
//     });
//   } catch (error) {
//     response.status(400).json({ error: error.message });
//   }
// };

// export const refreshToken = async (request, response) => {
//   try {
//     const { refreshToken } = request.body;

//     // Check if the provided refresh token exists in MongoDB
//     const refreshTokenDoc = await refreshTokenSchema.findOne({ refreshToken });
//     if (!refreshTokenDoc) {
//       throw new Error("Invalid refresh token");
//     }

//     const newAccessToken = setUser(refreshTokenDoc);

//     response.json({
//       success: true,
//       message: "Token refreshed successfully",
//       token: newAccessToken,
//     });
//   } catch (error) {
//     response.status(400).json({ error: error.message });
//   }
// };

// export const verifyAdultPin = async (request, response) => {
//   try {
//     const { pin } = request.body;

//     // Retrieve token from request headers
//     const token = request.headers["x-auth-header"];
//     const userId = request.headers["x-user-id"];

//     if (!token || !userId) {
//       throw new Error("Token or User ID not provided");
//     }

//     // Verify the token using the secret key
//     let refreshTokenDocument = await refreshTokenSchema.findOne({
//       token: token,
//       userId: userId,
//     });

//     if (!refreshTokenDocument) {
//       throw new Error("Invalid Token & User Id.");
//     }

//     // Find the user by the decoded token's ID
//     const user = await usersSchm.findById(userId);

//     if (!user) {
//       throw new Error("User not found");
//     }

//     if (!pin) {
//       throw new Error("Empty Pin Number");
//     }

//     const pinNumber = parseInt(pin);

//     if (pinNumber === user.pin) {
//       response.json({
//         success: true,
//         message: "PIN is valid",
//       });
//     } else {
//       response.json({
//         success: false,
//         message: "Invalid PIN",
//       });
//     }
//   } catch (error) {
//     response.status(400).json({ error: error.message });
//   }
// };
