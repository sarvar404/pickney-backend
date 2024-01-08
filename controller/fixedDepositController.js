import cron from "node-cron";
import moment from "moment";
import fixedDepositSchema from "../model/fixedDepositSchema.js";
import fixedDepositLogsSchema from "../model/fixedDepositLogsSchema.js";
import passbookSchema from "../model/passbookSchema.js";
import { code200, code400 } from "../responseCode.js";
import { FDType, fdStatus_MATURED, fdStatus_onGOING, interest_rate, is_credit } from "../contentId.js";

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

export const fdCalculation = async (request, response) => {
  try {
    const { stars, duration } = request.body;

    // Check if stars or duration is empty
    if (!stars || !duration) {
      const missingFields = [];
      if (!stars) missingFields.push("stars");
      if (!duration) missingFields.push("duration");
    
      const errorMessage = `The following field(s) are required: ${missingFields.join(', ')}`;
      
      return response.status(400).json({
        errorCode: code400,
        success: false,
        error: errorMessage,
      });
    }
    

    // Interest rate is 5%
    const interestRate = interest_rate; // 0.05;

    // Calculate principal, interest, and total
    const principal = stars * duration;
    const interest = principal * interestRate;
    const total = principal + interest;

    response.status(200).json({
      code: code200,
      success: true,
      message: "Calculation successful",
      result: {
        principal,
        interest,
        total,
      },
    });
  } catch (error) {
    response.status(400).json({
      errorCode: code400,
      success: false,
      error: error.message,
    });
  }
};

export const addFixedDeposit = async (request, response) => {
  try {
    const { userId, kidId, stars, interest, principal, duration, total, status, remarks } = request.body;

    // Calculate end_at date based on duration
    const today = moment();
    const end_at = today.add(duration, 'months');

    // If today's date is later than the desired day of the month, move to the next month
    if (today.date() > today.daysInMonth()) {
      end_at.add(1, 'months');
    }

    const fixedDepositData = {
      userId,
      kidId,
      stars,
      interest,
      principal,
      total,
      duration,
      end_at: end_at.toDate(), // "06/01/2024" end_at.toDate(),,
      status : fdStatus_onGOING,
      remarks,
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
      amount: data.total,
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
      available_balance: data.available_balance,
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

