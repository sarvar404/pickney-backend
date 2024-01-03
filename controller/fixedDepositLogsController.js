import fixedDepositLogsSchema from "../model/fixedDepositLogsSchema.js";
import { code200, code400 } from "../responseCode.js";

export const getFixedDepositLog = async (request, response) => {
  const id = request.params.id;
  try {
    const details = await fixedDepositLogsSchema.findById(id);
    response.status(200).json({
      code: code200,
      success: true,
      message: "Successful",
      data: details,
    });
  } catch (error) {
    response.status(404).json({ errorCode: code400, success: false, error: error.message });
  }
};

export const getAllFixedDepositLog = async (request, response) => {
  try {
    const details = await fixedDepositLogsSchema.find();
    const totalRecords = details.length;
    response.status(200).json({
      code: code200,
      success: true,
      message: "Successful",
      totalRecords: totalRecords,
      data: details,
    });
  } catch (err) {
    response.status(404).json({ errorCode: code400, success: false, message: "Not found" });
  }
};

export const addFixedDepositLog = async (request, response) => {
  try {
    const fixedDepositData = {
      fdId: request.body.fdId,
      status: request.body.status,
      amount: request.body.amount,
    };

    const savedFixedDeposit = await fixedDepositLogsSchema.create(fixedDepositData);

    response.status(200).json({
      code: code200,
      success: true,
      message: "Fixed Deposit paid successfully",
      id: savedFixedDeposit.id,
    });
  } catch (error) {
    response.status(400).json({ errorCode: code400, success: false, error: error.message });
  }
};

export const updateFixedDepositLog = async (request, response) => {
  try {
    const fixedDepositId = request.params.id;

    const updatedFixedDepositData = {
      status: request.body.status,
      amount: request.body.amount,
    };

    const updatedFixedDeposit = await fixedDepositLogsSchema.findOneAndUpdate(
      { _id: fixedDepositId },
      updatedFixedDepositData,
      { new: true }
    );

    if (!updatedFixedDeposit) {
      return response.status(404).json({
        errorCode: code400,
        success: false,
        message: "Paid Fixed Deposit not found",
      });
    }

    response.status(200).json({
      code: code200,
      success: true,
      message: "Paid Fixed Deposit updated successfully",
      updatedFixedDeposit,
    });
  } catch (error) {
    response.status(400).json({ errorCode: code400, success: false, error: error.message });
  }
};

export const deleteFixedDepositLog = async (request, response) => {
  try {
    const fixedDepositId = request.params.id;

    const deletedFixedDeposit = await fixedDepositLogsSchema.findByIdAndDelete(fixedDepositId);

    if (!deletedFixedDeposit) {
      return response.status(404).json({
        errorCode: code400,
        success: false,
        message: "Paid Fixed Deposit not found",
      });
    }

    response.status(200).json({
      code: code200,
      success: true,
      message: "Paid Fixed Deposit details deleted successfully",
    });
  } catch (error) {
    response.status(400).json({ errorCode: code400, success: false, error: error.message });
  }
};
