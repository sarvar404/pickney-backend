import expressAsyncHandler from "express-async-handler";
import mongoose from "mongoose";
import userSchema from "../model/userSchema.js";
import refreshTokenSchema from "../model/refreshTokenSchema.js";
import OTPSchema from "../model/OTPSchema.js";
import ForgotSchema from "../model/ForgotSchema.js";
import { compareAsc, format, parseISO } from "date-fns";
import { setUser } from "../service/auth.js";
// import { v4 as uuidv4 } from "uuid";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { generateOTP } from "../service/generateOTP.js";
import nodemailer from "nodemailer";

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;
let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Function to set OTP in user session
function setUserDataInSession(request, userId, otp) {
  request.session.userData = {
    userId,
    otp: {
      value: otp,
      // Set the expiration time for the OTP (e.g., 5 minutes)
      expirationTime: Date.now() + 5 * 60 * 1000,
    },
  };
}

export const OTPVerification = expressAsyncHandler(
  async (request, response) => {
    try {
      const { email } = request.body;

      const user = await userSchema.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") },
      });

      if (!user) {
        return response
          .status(400)
          .json({ success: false, message: "Invalid Email Address" });
      }

      const otp = generateOTP();

      // Set OTP in otp collection
      const expiryDate = new Date(Date.now() + 2 * 60 * 1000); // Set expiry date 5 minutes ahead

      // Save OTP details in the OTP collection
      const otpDocument = await OTPSchema.create({
        userId: user._id,
        otp,
        expiryDate,
        status: true,
      });

      const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject: "OTP from Pickney verification.",
        text: `Your OTP is: ${otp}`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.error(error);
          return response
            .status(500)
            .json({ success: false, message: "Failed to send OTP email" });
        } else {
          // console.log('Email sent successfully!');
          setTimeout(async () => {
            await OTPSchema.findByIdAndUpdate(otpDocument._id, {
              status: false,
            });
            console.log("OTP status updated after 2 minutes.");
          }, 2 * 60 * 1000);

          return response.status(200).json({
            success: true,
            message: "OTP sent successfully",
            userId: user.id,
          });
        }
      });
    } catch (err) {
      console.error(err);
      return response
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

export const OTPVerificationAndSignIn = expressAsyncHandler(
  async (request, response) => {
    try {
      const { userId, otp } = request.body;

      // Find the latest OTP for the given user ID
      const latestOTP = await OTPSchema.findOne({
        userId,
        status: true,
        expiryDate: { $gt: new Date() }, // Ensure the OTP is not expired
      }).sort({ _id: -1 });

      if (!latestOTP) {
        return response.status(400).json({
          success: false,
          message: "OTP not found or has been expired",
        });
      }

      // Compare the provided OTP with the stored OTP
      if (otp !== latestOTP.otp) {
        return response
          .status(400)
          .json({ success: false, message: "Invalid OTP" });
      }

      // Update the OTP status to false after successful verification
      await OTPSchema.findByIdAndUpdate(latestOTP._id, { status: false });

      // Your user sign-in logic here using userId
      const user = await userSchema.findById(userId);

      if (!user) {
        return response
          .status(400)
          .json({ success: false, message: "User not found" });
      }

      // Perform your sign-in logic here

      return response
        .status(200)
        .json({ success: true, message: "Sign-in successful" });
    } catch (err) {
      console.error(err);
      return response
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

export const forgotAndGetOTP = expressAsyncHandler(
  async (request, response) => {
    try {
      const { email } = request.body;

      const user = await userSchema.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") },
      });

      if (!user) {
        return response
          .status(400)
          .json({ success: false, message: "Invalid Email Address" });
      }

      const otp = generateOTP();

      // Set OTP in otp collection
      const expiryDate = new Date(Date.now() + 2 * 60 * 1000); // Set expiry date 5 minutes ahead

      // Save OTP details in the OTP collection
      const otpDocument = await ForgotSchema.create({
        userId: user._id,
        otp,
        expiryDate,
        status: true,
      });

      const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject: "OTP from Pickney verification.",
        text: `Your OTP is: ${otp}`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.error(error);
          return response
            .status(500)
            .json({ success: false, message: "Failed to send OTP email" });
        } else {
          // console.log('Email sent successfully!');
          setTimeout(async () => {
            await ForgotSchema.findByIdAndUpdate(otpDocument._id, {
              status: false,
            });
            console.log("OTP status updated after 2 minutes.");
          }, 2 * 60 * 1000);

          return response.status(200).json({
            success: true,
            message: "OTP sent successfully",
            userId: user.id,
          });
        }
      });
    } catch (err) {
      console.error(err);
      return response
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

export const reSetPassword = expressAsyncHandler(async (request, response) => {
  try {
    const { userId, otp, email, password } = request.body;

    // Find the latest OTP for the given user ID
    const latestOTP = await ForgotSchema.findOne({
      userId,
      status: true,
      expiryDate: { $gt: new Date() }, // Ensure the OTP is not expired
    }).sort({ _id: -1 });

    if (!latestOTP) {
      return response.status(400).json({
        success: false,
        message: "OTP not found or has been expired",
      });
    }

    // Compare the provided OTP with the stored OTP
    if (otp !== latestOTP.otp) {
      return response
        .status(400)
        .json({ success: false, message: "Invalid OTP" });
    }

    // Update the OTP status to false after successful verification
    await ForgotSchema.findByIdAndUpdate(latestOTP._id, { status: false });

    // Find the user by userId
    const user = await userSchema.findById(userId);

    if (!user) {
      return response
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Hash the new password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update the user's password with the hashed password
    user.password = hashedPassword;
    await user.save();

    return response
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    return response
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

export const registration = async (request, response) => {
  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(request.body.password, saltRounds);

    const userData = {
      name: request.body.name,
      email: request.body.email,
      guardian: request.body.guardian,
      phone: request.body.phone,
      password: passwordHash, // Store the hashed password
      photo: request.body.photo,
    };

    const savedUser = await userSchema.create(userData);

    response.status(201).json({
      success: true,
      message: "User registration successful",
      id: savedUser._id, // Assuming _id is the field name for the user ID
    });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
};

export const login = async (request, response) => {
  try {
    const { email, password } = request.body;

    // Check if the email exists in a case-insensitive manner
    const user = await userSchema.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    if (!user) {
      throw new Error("Invalid user & password");
    }

    // Verify the provided password against the stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Invalid user & password");
    }

    let refreshTokenDocument = await refreshTokenSchema.findOne({
      userId: user._id,
    });

    if (!refreshTokenDocument) {
      // If a refreshToken document does not exist, generate new token and refreshToken
      const token = setUser(user);
      // Save the new refreshToken in the refreshTokenSchema
      refreshTokenDocument = new refreshTokenSchema({
        userId: user._id,
        refreshToken: token,
        token: token,
      });
      await refreshTokenDocument.save();
    }

    // check token expired or not
    // const user123 = jwt.verify(refreshTokenDocument.token, SECRET_KEY, (error, response) => {
    //   console.log(error);
    //   console.log("here---------------------");
    //   console.log(response)
    // });

    // Generate refresh token
    response.cookie("token", refreshTokenDocument.token);
    response.cookie("refreshToken", refreshTokenDocument.refreshToken);
    response.status(200).json({
      success: true,
      message: "You have successfully logged in",
      token: refreshTokenDocument.token,
      refreshToken: refreshTokenDocument.refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    response.status(400).json({ error: error.message });
  }
};

export const refreshToken = async (request, response) => {
  try {
    const { refreshToken } = request.body;

    // Check if the provided refresh token exists in MongoDB
    const refreshTokenDoc = await refreshTokenSchema.findOne({ refreshToken });
    if (!refreshTokenDoc) {
      throw new Error("Invalid refresh token");
    }

    const newAccessToken = setUser(refreshTokenDoc);

    response.json({
      success: true,
      message: "Token refreshed successfully",
      token: newAccessToken,
    });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
};
export const accessTrue = async (request, response) => {
  try {
    response.status(200).json({
      success: true,
      message: "You have access",
    });
  } catch (error) {
    console.log(error, "inside controller ->...................");
    response.status(400).json({ error: error.message });
  }
};

export const deleteUser = async (request, response) => {
  try {
    const id = request.params.id; // Assuming the ID is provided in the URL params

    const deletedUser = await userSchema.findByIdAndDelete(id);

    if (!deletedUser) {
      return response.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    response.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    response.status(400).json({ success: false, error: error.message });
  }
};
