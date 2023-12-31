import kidSchema from "../model/kidSchema.js";
import userSchema from "../model/userSchema.js";
import refreshTokenKidsSchema from "../model/refreshTokenKidsSchema.js";
import { setKids } from "../service/auth.js";
import bcrypt from "bcrypt";
import { code200, code400, code500 } from "../responseCode.js";
import { KID, PARENT } from "../contentId.js";
import { trimVal } from "../validation/trim.js";

export const getSingleKid = async (request, response) => {
  const _id = request.params.id;

  try {
    // Find the event details
    const kidDetails = await kidSchema.findById(_id);

    if (!kidDetails) {
      return response.status(404).json({
        errorCode: code400,
        success: false,
        error: "Kid not found",
      });
    }

    response.status(200).json({
      code: code200,
      success: true,
      message: "Successful",
      event: kidDetails,
    });
  } catch (error) {
    response.status(500).json({
      errorCode: code400,
      success: false,
      error: error.message,
    });
  }
};

export const getAllKidList = async (request, response) => {
  try {
    const details = await kidSchema.find();
    const totalRecords = details.length;
    response.status(200).json({
      code: code200,
      success: true,
      message: "Successful",
      totalRecords: totalRecords,
      data: details,
    });
  } catch (err) {
    response
      .status(404)
      .json({ errorCode: code400, success: false, error: "Not found" });
  }
};

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

const addKidToUser = async (loginData, password, uniqueId, kidFK) => {
  try {
    // Check if the email already exists in userSchema
    const existingUser = await userSchema.findOne({
      email: loginData.email,
    });

    if (existingUser) {
      throw new Error("Email already exists");
    }

    const userData = {
      name: loginData.name,
      email: loginData.email,
      guardian: "EMPTY",
      password: password,
      photo: loginData.photo,
      verified: true,
      kidFK: kidFK,
      uniqueId: uniqueId,
      role: KID,
    };

    const savedUser = await userSchema.create(userData);

    return savedUser; // Return the saved user data
  } catch (error) {
    // The error will be caught and handled in the higher-level function (kidRegister)
    throw new Error(`Failed to add kid to user: ${error.message}`);
  }
};

export const updateKidToUser = async (loginData, password, kidFK) => {
  try {
    // console.log(kidFK);
    // process.exit();

    const update = {
      name: loginData.name,
      email: loginData.email,
      guardian: "EMPTY",
      password: password,
      photo: loginData.photo,
      verified: true,
      kidFK: kidFK,
      uniqueId: undefined,
      role: KID,
    };

    const options = {
      new: true,
    };

    const savedUser = await userSchema.findOneAndUpdate(
      {
        kidFK: kidFK,
      },
      update,
      options
    );

    return savedUser;
  } catch (error) {
    throw new Error(`Failed to update/add kid to user: ${error.message}`);
  }
};

export const kidRegister = async (request, response) => {
  try {
    // Check if the email already exists
    const existingKid = await kidSchema.findOne({
      email: request.body.email,
    });

    if (existingKid) {
      return response.status(400).json({
        code: code400,
        success: false,
        error: "Email already exists",
      });
    }

    const existingUser = await userSchema.findOne({
      _id: request.body.userId,
    });

    if (existingUser.verified === false) {
      throw new Error("Sorry, Invalid User");
    }

    // Generate a unique kidId
    const kidId = (await generateKidId(8)).toUpperCase();

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(request.body.password, saltRounds);

    // Kid data
    const loginData = {
      userId: request.body.userId,
      name: await trimVal(request.body.name),
      email: request.body.email,
      dob: request.body.dob,
      gender: request.body.gender,
      address: request.body.address,
      relation: request.body.relation,
      photo: request.body.photo,
    };

    // Create a new kid
    const newKid = await kidSchema.create(loginData);

    if (newKid) {
      // Add kid to user
      const savedUser = await addKidToUser(
        loginData,
        passwordHash,
        kidId,
        newKid._id
      );

      return response.status(200).json({
        code: code200,
        success: true,
        message: "Kid added successfully",
        id: savedUser.uniqueId,
      });
    } else {
      return response.status(400).json({
        code: code400,
        success: false,
        error: "Failed to add kid",
      });
    }
  } catch (error) {
    return response.status(400).json({
      code: code400,
      success: false,
      error: error.message,
    });
  }
};

export const kidUpdate = async (request, response) => {
  try {
    const kidId = request.body._id;

    // Find the existing kid by ID
    const existingKid = await kidSchema.findById(kidId);

    if (!existingKid) {
      return response.status(404).json({
        code: code400,
        success: false,
        error: "Kid not found",
      });
    }

    // Check if the email is being updated to an existing email
    if (request.body.email && request.body.email !== existingKid.email) {
      // Check if the email exists for other kids
      const emailExistsInKids = await kidSchema.findOne({
        email: request.body.email,
        _id: { $ne: kidId }, // Exclude the current kid from the search
      });

      // Check if the email exists for other users
      const emailExistsInUsers = await userSchema.findOne({
        email: request.body.email,
      });

      if (emailExistsInKids || emailExistsInUsers) {
        return response.status(400).json({
          code: code400,
          success: false,
          error: "Email already exists",
        });
      }
    }

    // Create an update object
    const update = {
      $set: {
        name: (await trimVal(request.body.name)) || existingKid.name,
        email: request.body.email || existingKid.email,
        dob: request.body.dob || existingKid.dob,
        gender: request.body.gender || existingKid.gender,
        address: request.body.address || existingKid.address,
        relation: request.body.relation || existingKid.relation,
        photo: request.body.photo || existingKid.photo,
      },
    };

    // Update password only if there is an incoming value for it
    let upComingPassword = undefined;
    if (request.body.password) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(request.body.password, saltRounds);
      upComingPassword = passwordHash;
    }

    // Save the updated kid and update the associated user
    const updatedKid = await kidSchema.findByIdAndUpdate(kidId, update, {
      new: true,
    });

    // Call the function to update/add kid to the user
    const updatingIntoUser = await updateKidToUser(
      updatedKid,
      upComingPassword,
      kidId
    );

    response.status(200).json({
      code: code200,
      success: true,
      message: "Kid updated successfully",
      data: updatedKid,
    });
  } catch (error) {
    response.status(500).json({
      code: code400,
      success: false,
      error: error.message,
    });
  }
};

export const kidLogin = async (request, response) => {
  try {
    return false;
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
    const refreshTokenDoc = await refreshTokenKidsSchema.findOne({
      refreshToken,
    });
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
    response.status(400).json({ errorCode: code400, error: error.message });
  }
};
