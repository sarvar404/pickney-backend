import expressAsyncHandler from "express-async-handler";
import mongoose from "mongoose";
import userSchema from "../model/userSchema.js";
import kidSchema from "../model/kidSchema.js";
import refreshTokenSchema from "../model/refreshTokenSchema.js";
import registrationOTPSchema from "../model/registrationOTPSchema.js";
import ForgotSchema from "../model/ForgotSchema.js";
import { compareAsc, format, parseISO } from "date-fns";
import { setKids, setUser } from "../service/auth.js";
// import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { generateOTP } from "../service/generateOTP.js";
import nodemailer from "nodemailer";
import { Vonage } from "@vonage/server-sdk";
import { KID, PARENT } from "../contentId.js";
import { code201, code400 } from "../responseCode.js";

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_SECRET_API,
});

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
      const otpDocument = await registrationOTPSchema.create({
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
            .json({ success: false, error: "Failed to send OTP email" });
        } else {
          // console.log('Email sent successfully!');
          setTimeout(async () => {
            await registrationOTPSchema.findByIdAndUpdate(otpDocument._id, {
              status: false,
            });
            // console.log("OTP status updated after 2 minutes.");
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
      const latestOTP = await registrationOTPSchema
        .findOne({
          userId,
          status: true,
          expiryDate: { $gt: new Date() }, // Ensure the OTP is not expired
        })
        .sort({ _id: -1 });

      if (!latestOTP) {
        return response.status(400).json({
          success: false,
          error: "OTP not found or has been expired",
        });
      }

      // Compare the provided OTP with the stored OTP
      if (otp !== latestOTP.otp) {
        return response
          .status(400)
          .json({ success: false, message: "Invalid OTP" });
      }

      // Update the OTP status to false after successful verification
      await registrationOTPSchema.findByIdAndUpdate(latestOTP._id, {
        status: false,
      });

      // Your user sign-in logic here using userId
      const user = await userSchema.findById(userId);

      if (!user) {
        return response
          .status(400)
          .json({ success: false, error: "User not found" });
      }

      // Perform your sign-in logic here

      return response
        .status(200)
        .json({ success: true, message: "Sign-in successful" });
    } catch (err) {
      console.error(err);
      return response
        .status(500)
        .json({ success: false, error: "Internal server error" });
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
          .json({ success: false, error: "Invalid Email Address" });
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
            .json({ success: false, error: "Failed to send OTP email" });
        } else {
          // console.log('Email sent successfully!');
          setTimeout(async () => {
            await ForgotSchema.findByIdAndUpdate(otpDocument._id, {
              status: false,
            });
            // console.log("OTP status updated after 2 minutes.");
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
        .json({ success: false, error: "Internal server error" });
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
        error: "OTP not found or has been expired",
      });
    }

    // Compare the provided OTP with the stored OTP
    if (otp !== latestOTP.otp) {
      return response
        .status(400)
        .json({ success: false, error: "Invalid OTP" });
    }

    // Update the OTP status to false after successful verification
    await ForgotSchema.findByIdAndUpdate(latestOTP._id, { status: false });

    // Find the user by userId
    const user = await userSchema.findById(userId);

    if (!user) {
      return response
        .status(400)
        .json({ success: false, error: "User not found" });
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
      .json({ success: false, error: "Internal server error" });
  }
});

// export const registration = async (request, response) => {
//   try {
//     const saltRounds = 10;
//     const passwordHash = await bcrypt.hash(request.body.password, saltRounds);

//     const userData = {
//       name: request.body.name,
//       email: request.body.email,
//       guardian: request.body.guardian,
//       phone: request.body.phone,
//       password: passwordHash,
//       photo: request.body.photo,
//     };

//     // Create a new user in the database
//     const savedUser = await userSchema.create(userData);

//     // Send Vonage verification code via SMS
//     const number = `91${request.body.phone}`; // Assuming phone is provided in international format

//     // Start verification
//     const startResponse = await vonage.verify.start({
//       number,
//       brand: 'Vonage',
//     });
//     const requestId = startResponse.request_id;

//     console.log(`Verification started. Request ID: ${requestId}`);

//     // Optionally, you can check the verification code (if received from the user)
//     // const checkResponse = await vonage.verify.check(requestId, CODE);
//     // console.log(checkResponse);

//     response.status(201).json({
//       success: true,
//       message: 'User registration successful. OTP sent to the provided phone number.',
//       id: savedUser._id,
//       requestId, // Optionally, you can include the requestId in the response
//     });
//   } catch (error) {
//     response.status(400).json({ errorCode : code400, error: error.message });
//   }
// };

export const registration = expressAsyncHandler(async (request, response) => {
  try {
    // Check if a user with the same email and unverified status already exists
    let existingUser = await userSchema.findOne({
      email: request.body.email,
      verified: false,
    });

    if (existingUser) {
      // User is unverified, update the existing user's information
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(request.body.password, saltRounds);

      const userData = {
        name: request.body.name,
        guardian: request.body.guardian,
        phone: request.body.phone,
        password: passwordHash,
        photo: request.body.photo,
        verified: false,
      };

      existingUser = await userSchema.findByIdAndUpdate(
        existingUser._id,
        userData,
        {
          new: true, // Return the updated document
        }
      );

      const otp = generateOTP().toUpperCase();

      // Set OTP in otp collection
      const expiryDate = new Date(
        Date.now() + process.env.TIMEOUT_OTP * 60 * 1000
      ); // Set expiry date 2 minutes ahead

      // Save OTP details in the OTP collection
      const otpDocument = await registrationOTPSchema.create({
        userId: existingUser._id,
        otp,
        expiryDate,
        status: true,
      });

      const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: existingUser.email,
        subject: "OTP from Pickney verification.",
        text: `Your OTP is: ${otp}`,
      };

      transporter.sendMail(mailOptions, async function (error, info) {
        if (error) {
          console.error(error);
          // Rollback: Delete the OTP record if OTP email sending fails
          await registrationOTPSchema.findByIdAndDelete(otpDocument._id);

          return response
            .status(500)
            .json({ success: false, error: "Failed to send OTP email" });
        } else {
          // console.log('Email sent successfully!');
          setTimeout(async () => {
            await registrationOTPSchema.findByIdAndUpdate(otpDocument._id, {
              status: false,
            });
            // console.log("OTP status updated after 2 minutes.");
          }, process.env.TIMEOUT_OTP * 60 * 1000);

          return response.status(200).json({
            success: true,
            message: "OTP sent successfully",
            userId: existingUser._id,
          });
        }
      });
    } else {
      // Check if a user with the same email and verified status exists
      const verifiedUser = await userSchema.findOne({
        email: request.body.email,
        verified: true,
      });

      if (verifiedUser) {
        return response.status(400).json({
          success: false,
          message: "User with the same email is already verified",
        });
      }

      // User not found, create a new user
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(request.body.password, saltRounds);

      const userData = {
        name: request.body.name,
        email: request.body.email,
        guardian: request.body.guardian,
        phone: request.body.phone,
        password: passwordHash,
        photo: request.body.photo,
        verified: false,
        role: PARENT,
      };

      // Create a new user in the database
      const savedUser = await userSchema.create(userData);

      const otp = generateOTP();

      // Set OTP in otp collection
      const expiryDate = new Date(
        Date.now() + process.env.TIMEOUT_OTP * 60 * 1000
      ); // Set expiry date 2 minutes ahead

      // Save OTP details in the OTP collection
      const otpDocument = await registrationOTPSchema.create({
        userId: savedUser._id,
        otp,
        expiryDate,
        status: true,
      });

      const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: savedUser.email,
        subject: "OTP from Pickney verification.",
        text: `Your OTP is: ${otp}`,
      };

      transporter.sendMail(mailOptions, async function (error, info) {
        if (error) {
          console.error(error);
          // Rollback: Delete the user if OTP email sending fails
          await userSchema.findByIdAndDelete(savedUser._id);
          await registrationOTPSchema.findByIdAndDelete(otpDocument._id);

          return response
            .status(500)
            .json({ success: false, message: "Failed to send OTP email" });
        } else {
          // console.log('Email sent successfully!');
          setTimeout(async () => {
            await registrationOTPSchema.findByIdAndUpdate(otpDocument._id, {
              status: false,
            });
            // console.log("OTP status updated after 2 minutes.");
          }, process.env.TIMEOUT_OTP * 60 * 1000);

          return response.status(200).json({
            success: true,
            message: "OTP sent successfully",
            userId: savedUser._id,
          });
        }
      });
    }
  } catch (err) {
    console.error(err);
    return response
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

export const registrationVerify = expressAsyncHandler(
  async (request, response) => {
    try {
      const { userId, otp } = request.body;

      // Find the latest OTP for the given user ID
      const latestOTP = await registrationOTPSchema
        .findOne({
          userId,
          status: true,
          expiryDate: { $gt: new Date() }, // Ensure the OTP is not expired
        })
        .sort({ _id: -1 });

      if (!latestOTP) {
        return response.status(400).json({
          success: false,
          error: "OTP not found or has been expired",
        });
      }

      // Compare the provided OTP with the stored OTP
      if (otp !== latestOTP.otp) {
        return response
          .status(400)
          .json({ success: false, error: "Invalid OTP" });
      }

      // Update the OTP status to false after successful verification
      await registrationOTPSchema.findByIdAndUpdate(latestOTP._id, {
        status: false,
      });
      await userSchema.findByIdAndUpdate(userId, { verified: true });

      // Your user sign-in logic here using userId
      const user = await userSchema.findById(userId);

      if (!user) {
        return response
          .status(400)
          .json({ success: false, error: "User not found" });
      }

      // Perform your sign-in logic here

      return response
        .status(200)
        .json({ success: true, message: "Sign-in successful" });
    } catch (err) {
      console.error(err);
      return response
        .status(500)
        .json({ success: false, error: "Internal server error" });
    }
  }
);

const PARENTLOGIN = async (email, password, response) => {
  const user = await userSchema.findOne({
    email: { $regex: new RegExp(`^${email}$`, "i") },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new Error("Invalid email or password");
  }

  let refreshTokenDocument = await refreshTokenSchema.findOne({
    userId: user._id,
  });

  if (!refreshTokenDocument) {
    const token = setUser(user);
    refreshTokenDocument = new refreshTokenSchema({
      userId: user._id,
      refreshToken: token,
      token: token,
      role: PARENT,
    });
    await refreshTokenDocument.save();
  }

  response.cookie("token", refreshTokenDocument.token);
  response.cookie("refreshToken", refreshTokenDocument.refreshToken);
  response.status(200).json({
    success: true,
    message: "You have successfully logged in",
    token: refreshTokenDocument.token,
    refreshToken: refreshTokenDocument.refreshToken,
    role: user.role,
  });
};

const KIDLOGIN = async (uniqueId, password, response) => {
  const kid = await userSchema.findOne({
    uniqueId: uniqueId,
  });

  if (!kid) {
    return response.status(404).json({
      code: code400,
      success: false,
      error: "Invalid User Id",
    });
  }

  const passwordMatch = await bcrypt.compare(password, kid.password);

  if (!passwordMatch) {
    return response.status(404).json({
      code: code400,
      success: false,
      error: "Invalid User Password",
    });
  }

  let refreshTokenDocument = await refreshTokenSchema.findOne({
    kidId: kid._id,
  });

  if (!refreshTokenDocument) {
    const token = setUser(kid);
    refreshTokenDocument = new refreshTokenSchema({
      userId: kid._id,
      refreshToken: token,
      token: token,
      role: KID,
    });
    await refreshTokenDocument.save();
  }

  response.cookie("token", refreshTokenDocument.token);
  response.cookie("refreshToken", refreshTokenDocument.refreshToken);
  response.status(200).json({
    success: true,
    message: "You have successfully logged in",
    token: refreshTokenDocument.token,
    refreshToken: refreshTokenDocument.refreshToken,
    role: kid.role,
  });
};

export const login = async (request, response) => {
  try {
    const { id, password } = request.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(id);

    if (isEmail) {
      await PARENTLOGIN(id, password, response);
    } else {
      await KIDLOGIN(id, password, response);
    }
  } catch (error) {
    console.error("Login error:", error);
    response.status(400).json({ errorCode : code400, error: error.message });
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
    response.status(400).json({ errorCode : code400, error: error.message });
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
    response.status(400).json({ errorCode : code400, error: error.message });
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
    response.status(400).json({ success: false, errorCode : code400, error: error.message });
  }
};

// PROFILE GET /

export const getParentKids = async (userId) => {
  try {
    const details = await kidSchema.find({ userId }).select('name');
    return details;
  } catch (error) {
    // Throw an error to be caught and handled by the calling function
    throw new Error("Kids not found");
  }
};

export const getProfile = async (request, response) => {
  const id = request.params.id;

  try {
    const userDetails = await userSchema.findById(id);

    if (!userDetails) {
      return response.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const parentKids = await getParentKids(userDetails._id);

    response.status(200).json({
      success: true,
      message: "Successful",
      data: {
        userDetails,
        parentKids,
      },
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: "Internal server error",
      errorCode : code400, error: error.message,
    });
  }
};

export const getAllProfiles = async (request, response) => {
  try {
    // Filter records where role is "P"
    const details = await userSchema.find({ role: "P" });

    const totalRecords = details.length;
    response.status(200).json({
      code: code201,
      success: true,
      message: "Successful",
      totalRecords: totalRecords,
      data: details,
    });
  } catch (err) {
    response.status(404).json({ errorCode: code400, success: false, error: "Not found" });
  }
};

