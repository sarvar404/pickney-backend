import kidSchema from "../model/kidSchema.js";
import refreshTokenKidsSchema from "../model/refreshTokenKidsSchema.js";
import { setKids } from "../service/auth.js";
import bcrypt from "bcrypt";

// Function to generate a random string of specified length
const generateKidId = async (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let kidId = "";
  for (let i = 0; i < length; i++) {
    kidId += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Check if the generated kidId already exists in the database
  const existingKid = await kidSchema.findOne({ kidId });

  // If the kidId is not unique, recursively call the function to generate a new one
  if (existingKid) {
    return generateKidId(length);
  }

  return kidId;
};

export const kidRegister = async (request, response) => {
  try {
    if (request.body.password !== request.body.confirmPassword) {
      return response.status(400).json({
        success: false,
        message: "Password and confirm password do not match",
      });
    }
    const kidId = await generateKidId(6);
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(request.body.password, saltRounds);

    const loginData = {
      kidId: kidId,
      userId: request.body.userId,
      name: request.body.name,
      password: passwordHash,
      dob: request.body.dob,
      gender: request.body.gender,
      address: request.body.address,
      relation: request.body.relation,
      photo: request.body.photo,
    };

    const kids = await kidSchema.create(loginData);

    response.status(201).json({
      success: true,
      message: "Kid Added successfully",
      id: kids.kidId,
    });
  } catch (error) {
    response.status(400).json({ success: false, error: error.message });
  }
};

export const kidLogin = async (request, response) => {
  try {
    const { kidId, password } = request.body;

    // Check if the email exists in a case-insensitive manner
    const kid = await kidSchema.findOne({
      kidId: kidId,
    });

    if (!kid) {
      throw new Error("Invalid kid & password");
    }

    // Verify the provided password against the stored hash
    const passwordMatch = await bcrypt.compare(password, kid.password);

    if (!passwordMatch) {
      throw new Error("Invalid user & password");
    }

    let refreshTokenDocument = await refreshTokenKidsSchema.findOne({
      kidId: kid._id,
    });

    if (!refreshTokenDocument) {
      // If a refreshToken document does not exist, generate new token and refreshToken
      const token = setKids(kid);
      // Save the new refreshToken in the refreshTokenKidsSchema
      refreshTokenDocument = new refreshTokenKidsSchema({
        kidId: kid._id,
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
    const refreshTokenDoc = await refreshTokenKidsSchema.findOne({ refreshToken });
    if (!refreshTokenDoc) {
      throw new Error("Invalid refresh token");
    }

    const newAccessToken = setKids(refreshTokenDoc);

    response.json({
      success: true,
      message: "Token refreshed successfully",
      token: newAccessToken,
    });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
};
