import loanSchema from "../model/loanSchema.js";
import loanLogsSchema from "../model/loanLogsSchema.js";
import { code200, code400 } from "../responseCode.js";
import { is_pending } from "../contentId.js";
import {
  calculateDynamicEmiDates,
  calculateEmiDates,
} from "../helper_function.js";

export const getLoan = async (request, response) => {
  const id = request.params.id;
  try {
    const details = await loanSchema.findById(id);

    if (!details) {
      return response.status(404).json({
        errorCode: code400,
        success: false,
        error: "Event not found",
      });
    }

    // Fetch loan logs based on the loan ID
    const logs = await loanLogsSchema.find({ loanId: details._id });

    response.status(200).json({
      code: code200,
      success: true,
      message: "Successful",
      data: details,
      logs,
    });
  } catch (error) {
    response
      .status(404)
      .json({ errorCode: code400, success: false, error: error.message });
  }
};


export const getAllLoan = async (request, response) => {
  try {
    const details = await loanSchema.find();
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
      .json({ errorCode: code400, success: false, message: "Not found" });
  }
};

export const updateLoan = async (request, response) => {
  try {
    const loanId = request.params.id;

    const updatedLoanData = {
      created_by: request.body.created_by,
      amount: request.body.amount,
      interest: request.body.interest,
      duration: request.body.duration,
      emi_star: request.body.emi_star,
      ends_at: request.body.ends_at,
      status: request.body.status,
      remarks: request.body.remarks,
    };

    const updatedLoan = await loanSchema.findOneAndUpdate(
      { _id: loanId },
      updatedLoanData,
      { new: true }
    );

    if (!updatedLoan) {
      return response.status(404).json({
        errorCode: code400,
        success: false,
        message: "Loan not found",
      });
    }

    response.status(200).json({
      code: code200,
      success: true,
      message: "Loan updated successfully",
      updatedLoan,
    });
  } catch (error) {
    response
      .status(400)
      .json({ errorCode: code400, success: false, error: error.message });
  }
};

export const deleteLoan = async (request, response) => {
  try {
    const loanId = request.params.id;

    // Find and delete the loan
    const deletedLoan = await loanSchema.findByIdAndDelete(loanId);

    if (!deletedLoan) {
      return response.status(404).json({
        errorCode: code400,
        success: false,
        message: "Loan not found",
      });
    }

    // Delete logs associated with the loan
    const deletedLogs = await loanLogsSchema.deleteMany({ loanId });
    
    // Assuming the correct field is `entryId` in passbookSchema, delete related passbook entries
    const deletedPassbookEntries = await passbookSchema.deleteMany({ entryId: loanId });

    response.status(200).json({
      code: code200,
      success: true,
      message: "Loan deleted successfully",
      deletedLogsCount: deletedLogs.deletedCount,
      deletedPassbookEntriesCount: deletedPassbookEntries.deletedCount,
    });
  } catch (error) {
    response
      .status(400)
      .json({ errorCode: code400, success: false, error: error.message });
  }
};



// cron job .....

export const addLoanLog = async (data, emi) => {
  try {
    const { _id, userId, kidId } = data;

    // Assuming `ends_at` is the date when the first EMI is due
    const emiDates = calculateDynamicEmiDates(data.duration);

    // Create multiple entries for each EMI date
    const loanLogPromises = emiDates.map(async (emiDate) => {
      const loanLogData = {
        userId,
        kidId,
        loanId: _id,
        status: is_pending, // Make sure is_pending is defined correctly
        emi_date: emiDate,
        emi_paid_date: "EMPTY",
        emi_amount: parseFloat(emi),
      };
      // Assuming loanLogsSchema.create returns a promise
      return await loanLogsSchema.create(loanLogData);
    });

    const savedLoanLogs = await Promise.all(loanLogPromises);

    return {
      code: code200,
      success: true,
      message: "Loan Logs created successfully",
      ids: savedLoanLogs.map((log) => log.id),
    };
  } catch (error) {
    return {
      errorCode: code400,
      success: false,
      error: error.message,
    };
  }
};

export const addLoan = async (request, response) => {
  try {
    const { interest, duration, amount } = request.body;
    // const totalLoanAmount = amount + interest * duration;
    // const emi = totalLoanAmount / duration;

    const totalLoanAmount = amount + interest;
    const emi = (totalLoanAmount / duration).toFixed(4);

    const loanData = {
      userId: request.body.userId,
      kidId: request.body.kidId,
      interest: request.body.interest,
      duration: request.body.duration,
      amount: request.body.amount,
      status: request.body.status,
      remarks: request.body.remarks,
    };

    const savedLoan = await loanSchema.create(loanData);

    if (savedLoan) {
      addLoanLog(savedLoan, emi);
    }

    response.status(200).json({
      code: code200,
      success: true,
      message: "Loan created successfully",
      id: savedLoan.id,
    });
  } catch (error) {
    response
      .status(400)
      .json({ errorCode: code400, success: false, error: error.message });
  }
};

