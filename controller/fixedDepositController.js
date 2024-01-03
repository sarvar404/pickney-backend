import cron from "node-cron";
import moment from "moment";
import fixedDepositSchema from "../model/fixedDepositSchema.js";
import fixedDepositLogsSchema from "../model/fixedDepositLogsSchema.js";
import passbookSchema from "../model/passbookSchema.js";
import { code200, code400 } from "../responseCode.js";
import { FDType, fdStatus_MATURED, is_credit } from "../contentId.js";

export const getFixedDeposit = async (request, response) => {
  const id = request.params.id;
  // console.log(id)
  try {
    const details = await fixedDepositSchema.findById(id);

    if (!details) {
      return response.status(404).json({
        errorCode: code400,
        success: false,
        error: "fd not found",
      });
    }

    // Fetch loan logs based on the loan ID
    const logs = await fixedDepositLogsSchema.find({ fdId: details._id });


    response.status(200).json({
      code: code200,
      success: true,
      message: "successful",
      data: details,
      logs
    });
  } catch (error) {
    response
      .status(404)
      .json({ errorCode: code400, success: false, error: error });
  }
};

export const getAllFixedDeposit = async (request, response) => {
  try {
    const details = await fixedDepositSchema.find();
    const totalRecords = details.length;
    response.status(200).json({
      code: code200,
      success: true,
      message: "successful",
      totalRecords: totalRecords,
      data: details,
    });
  } catch (err) {
    response
      .status(404)
      .json({ errorCode: code400, success: false, message: "not found" });
  }
};

export const updateFixedDeposit = async (request, response) => {
  try {
    const fixedDepositId = request.params.id;

    const updatedFixedDepositData = {
      principal: request.body.principal,
      interest: request.body.interest,
      duration: request.body.duration,
      end_at: request.body.end_at,
      status: request.body.status,
      remarks: request.body.remarks,
    };

    const updatedFixedDeposit = await fixedDepositSchema.findOneAndUpdate(
      { _id: fixedDepositId },
      updatedFixedDepositData,
      { new: true }
    );

    if (!updatedFixedDeposit) {
      return response.status(404).json({
        errorCode: code400,
        success: false,
        message: "Fixed Deposit not found",
      });
    }

    response.status(200).json({
      code: code200,
      success: true,
      message: "Fixed Deposit updated successfully",
      updatedFixedDeposit,
    });
  } catch (error) {
    response
      .status(400)
      .json({ errorCode: code400, success: false, error: error.message });
  }
};

export const deleteFixedDeposit = async (request, response) => {
  try {
    const fixedDepositId = request.params.id;

    const deletedFixedDeposit = await fixedDepositSchema.findByIdAndDelete(
      fixedDepositId
    );

    if (!deletedFixedDeposit) {
      return response.status(404).json({
        errorCode: code400,
        success: false,
        message: "Fixed Deposit not found",
      });
    }

    const deletedLogs = await fixedDepositLogsSchema.deleteMany({ fdId: deletedFixedDeposit });
    
    // Assuming the correct field is `entryId` in passbookSchema, delete related passbook entries
    const deletedPassbookEntries = await passbookSchema.deleteMany({ entryId: fixedDepositId });

    response.status(200).json({
      code: code200,
      success: true,
      message: "Fixed Deposit deleted successfully",
    });
  } catch (error) {
    response
      .status(400)
      .json({ errorCode: code400, success: false, error: error.message });
  }
};

export const addFixedDeposit = async (request, response) => {
  try {
    const fixedDepositData = {
      userId: request.body.userId,
      kidId: request.body.kidId,
      stars: request.body.stars,
      interest: request.body.interest, // rate of interest 5.5
      principal: request.body.principal, // principal of ammount 50,000
      duration: request.body.duration, // period of deposit
      end_at: request.body.end_at, // maturity date
      status: request.body.status,
      remarks: request.body.remarks,
    };

    const savedFixedDeposit = await fixedDepositSchema.create(fixedDepositData);

    response.status(200).json({
      code: code200,
      success: true,
      message: "Fixed Deposit created successfully",
      id: savedFixedDeposit.id,
    });
  } catch (error) {
    response
      .status(400)
      .json({ errorCode: code400, success: false, error: error.message });
  }
};

// cron job

export const addFixedDepositLog = async (data, callback) => {
  try {
    const fixedDepositData = {
      fdId: data.fdId,
      status: data.status,
      amount: data.principal,
    };

    const savedFixedDeposit = await fixedDepositLogsSchema.create(
      fixedDepositData
    );

    callback({
      code: code200,
      success: true,
      message: "Fixed Deposit paid successfully",
      id: savedFixedDeposit.id,
    });
  } catch (error) {
    callback({ errorCode: code400, success: false, error: error.message });
  }
};

export const addPassbook = async (data, callback) => {
  try {
    const passbookData = {
      userId: data.userId,
      entryId: data.entryId,
      entryType: FDType,
      status: data.status,
      remarks: "FD has been matured",
      balance_stars: data.principal,
      photo: "http://dummy.jpg",
      is_credit: is_credit,
    };

    const savedPassbook = await passbookSchema.create(passbookData);

    callback({
      success: true,
      message: "Passbook created successfully",
      id: savedPassbook.id,
    });
  } catch (error) {
    callback({ errorCode: code400, success: false, error: error.message });
  }
};

