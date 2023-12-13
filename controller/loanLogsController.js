import loanLogsSchema from "../model/loanLogsSchema.js";
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
    response.status(404).json({ errorCode: code400, success: false, error: error.message });
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
    response.status(404).json({ errorCode: code400, success: false, message: "Not found" });
  }
};

export const addLoanLog = async (request, response) => {
  try {
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
    response.status(400).json({ errorCode: code400, success: false, error: error.message });
  }
};

export const updateLoanLog = async (request, response) => {
  try {
    const loanLogId = request.params.id;

    const updatedLoanLogData = {
      status: request.body.status,
      emi_date: request.body.emi_date,
      emi_paid_date: request.body.emi_paid_date,
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
    }

    response.status(200).json({
      code: code201,
      success: true,
      message: "Loan Log updated successfully",
      updatedLoanLog,
    });
  } catch (error) {
    response.status(400).json({ errorCode: code400, success: false, error: error.message });
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
    response.status(400).json({ errorCode: code400, success: false, error: error.message });
  }
};
