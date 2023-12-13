import fixedDepositSchema from "../model/fixedDepositSchema.js";
import { code201, code400 } from "../responseCode.js";

export const getFixedDeposit = async (request, response) => {
  const id = request.params.id;
  // console.log(id)
  try {
    const details = await fixedDepositSchema.findById(id);
    response.status(200).json({
      code : code201,
      success: true,
      message: "successful",
      data: details,
    });
  } catch (error) {
    response.status(404).json({ errorCode : code400, success: false, error: error });
  }
};

export const getAllFixedDeposit = async (request, response) => {
  try {
    const details = await fixedDepositSchema.find();
    const totalRecords = details.length;
    response.status(200).json({
      code : code201,
      success: true,
      message: "successful",
      totalRecords: totalRecords,
      data : details
      
    });
  } catch (err) {
    response.status(404).json({ errorCode : code400,success: false, message: "not found" });
  }
};

export const addFixedDeposit = async (request, response) => {
  try {
    const fixedDepositData = {
      userId: request.body.userId,
      created_by: request.body.created_by,
      principal: request.body.principal, // principal of ammount 50,000
      interest: request.body.interest, // rate of interest 5.5
      duration: request.body.duration, // period of deposit
      end_at: request.body.end_at, // maturity date
      status: request.body.status,
      remarks: request.body.remarks,
    };

    const savedFixedDeposit = await fixedDepositSchema.create(fixedDepositData);

    response.status(201).json({
      code : code201,
      success: true,
      message: "Fixed Deposit created successfully",
      id: savedFixedDeposit.id,
    });
  } catch (error) {
    response.status(400).json({ errorCode : code400, success: false, error: error.message });
  }
};

export const updateFixedDeposit = async (request, response) => {
  try {
    const fixedDepositId = request.params.id;

    const updatedFixedDepositData = {
      created_by: request.body.created_by,
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
        errorCode : code400,
        success: false,
        message: "Fixed Deposit not found",
      });
    }

    response.status(200).json({
      code : code201,
      success: true,
      message: "Fixed Deposit updated successfully",
      updatedFixedDeposit,
    });
  } catch (error) {
    response.status(400).json({ errorCode : code400, success: false, error: error.message });
  }
};

export const deleteFixedDeposit = async (request, response) => {
  try {
    const fixedDepositId = request.params.id;

    const deletedFixedDeposit = await fixedDepositSchema.findByIdAndDelete(fixedDepositId);

    if (!deletedFixedDeposit) {
      return response.status(404).json({
        errorCode : code400,
        success: false,
        message: "Fixed Deposit not found",
      });
    }

    response.status(200).json({
      code : code201,
      success: true,
      message: "Fixed Deposit deleted successfully",
    });
  } catch (error) {
    response.status(400).json({ errorCode : code400, success: false, error: error.message });
  }
};
