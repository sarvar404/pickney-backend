import mongoose from "mongoose";
import userSchema from "../model/userSchema.js";
import refreshTokenSchema from "../model/refreshTokenSchema.js";
import { compareAsc, format, parseISO } from "date-fns";
import { setUser } from "../service/auth.js";
// import { v4 as uuidv4 } from "uuid";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

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
    console.log(error , "inside controller ->...................")
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
      message: "User deleted successfully"
    });
  } catch (error) {
    response.status(400).json({ success: false, error: error.message });
  }
};
