import moment from "moment";
import { is_debit, is_paid, loanType } from "../contentId.js";
import loanLogsSchema from "../model/loanLogsSchema.js";
import passbookSchema from "../model/passbookSchema.js";
import { code201, code400 } from "../responseCode.js";

export const getLoanLog = async (request, response) => {
  const id = request.params.id;
  try {
    const details = await loanLogsSchema.findById(id);
    response.status(200).json({
      code: code201,
      success: true,
      message: "Successful",
      data: details,
    });
  } catch (error) {
    response
      .status(404)
      .json({ errorCode: code400, success: false, error: error.message });
  }
};

export const getAllLoanLog = async (request, response) => {
  try {
    const details = await loanLogsSchema.find();
    const totalRecords = details.length;
    response.status(200).json({
      code: code201,
      success: true,
      message: "Successful",
      totalRecords: totalRecords,
      data: details,
    });
  } catch (err) {
    response
      .status(404)
      .json({ errorCode: code400, success: false, message: "Not found" });
  }
};

export const addLoanLog = async (request, response) => {
  try {
    return false;
    const loanLogData = {
      loanId: request.body.loanId,
      status: request.body.status,
      emi_date: request.body.emi_date,
      emi_paid_date: request.body.emi_paid_date,
    };

    const savedLoanLog = await loanLogsSchema.create(loanLogData);

    response.status(201).json({
      code: code201,
      success: true,
      message: "Loan Log created successfully",
      id: savedLoanLog.id,
    });
  } catch (error) {
    response
      .status(400)
      .json({ errorCode: code400, success: false, error: error.message });
  }
};

export const deleteLoanLog = async (request, response) => {
  try {
    const loanLogId = request.params.id;

    const deletedLoanLog = await loanLogsSchema.findByIdAndDelete(loanLogId);

    if (!deletedLoanLog) {
      return response.status(404).json({
        errorCode: code400,
        success: false,
        message: "Loan Log not found",
      });
    }

    response.status(200).json({
      code: code201,
      success: true,
      message: "Loan Log deleted successfully",
    });
  } catch (error) {
    response
      .status(400)
      .json({ errorCode: code400, success: false, error: error.message });
  }
};

export const addPassbook = async (data) => {
  try {
    const passbookData = {
      userId: data.userId,
      entryId: data._id,
      entryType: loanType,
      status: data.status,
      remarks: "EMI has been paid",
      balance_stars: data.emi_amount,
      photo: "http://dummy.jpg",
      is_credit: is_debit,
    };

    const savedPassbook = await passbookSchema.create(passbookData);

    return savedPassbook; // Return the created passbook entry
  } catch (error) {
    console.error("Error in addPassbook:", error);
    throw error; // Re-throw the error to be caught by the calling function
  }
};

export const updateLoanLog = async (request, response) => {
  try {
    const currentDate = moment();
    const loanLogId = request.params.id;

    const existingLoanLog = await loanLogsSchema.findById(loanLogId);
    if (existingLoanLog && existingLoanLog.status === is_paid) {
      return response.status(400).json({
        errorCode: code400,
        success: false,
        message: "Emi has already been paid for this loan log",
      });
    }


    const updatedLoanLogData = {
      status: request.body.status,
      emi_paid_date: currentDate.toDate(),
    };

    const updatedLoanLog = await loanLogsSchema.findOneAndUpdate(
      { _id: loanLogId },
      updatedLoanLogData,
      { new: true }
    );

    if (!updatedLoanLog) {
      return response.status(404).json({
        errorCode: code400,
        success: false,
        message: "Loan Log not found",
      });
    } else {
      const savedPassbook = await addPassbook(updatedLoanLog);

      // Handle savedPassbook as needed

      response.status(200).json({
        code: code201,
        success: true,
        message: "Emi Loan Paid successfully",
        updatedLoanLog,
        savedPassbook,
      });
    }
  } catch (error) {
    console.error("Error in updateLoanLog:", error);
    response.status(500).json({
      errorCode: code400,
      success: false,
      error: "Internal Server Error",
    });
  }
};
