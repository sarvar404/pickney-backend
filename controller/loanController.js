import loanSchema from "../model/loanSchema.js";
import { code201, code400 } from "../responseCode.js";

export const getLoan = async (request, response) => {
  const id = request.params.id;
  try {
    const details = await loanSchema.findById(id);
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

export const getAllLoan = async (request, response) => {
  try {
    const details = await loanSchema.find();
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

export const addLoan = async (request, response) => {
  try {
    const loanData = {
      userId: request.body.userId,
      created_by: request.body.created_by,
      amount: request.body.amount,
      interest: request.body.interest,
      duration: request.body.duration,
      emi_star: request.body.emi_star,
      ends_at: request.body.ends_at,
      status: request.body.status,
      remarks: request.body.remarks,
    };

    const savedLoan = await loanSchema.create(loanData);

    response.status(201).json({
      code: code201,
      success: true,
      message: "Loan created successfully",
      id: savedLoan.id,
    });
  } catch (error) {
    response.status(400).json({ errorCode: code400, success: false, error: error.message });
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
      code: code201,
      success: true,
      message: "Loan updated successfully",
      updatedLoan,
    });
  } catch (error) {
    response.status(400).json({ errorCode: code400, success: false, error: error.message });
  }
};

export const deleteLoan = async (request, response) => {
  try {
    const loanId = request.params.id;

    const deletedLoan = await loanSchema.findByIdAndDelete(loanId);

    if (!deletedLoan) {
      return response.status(404).json({
        errorCode: code400,
        success: false,
        message: "Loan not found",
      });
    }

    response.status(200).json({
      code: code201,
      success: true,
      message: "Loan deleted successfully",
    });
  } catch (error) {
    response.status(400).json({ errorCode: code400, success: false, error: error.message });
  }
};
