import passbookSchema from "../model/passbookSchema.js";
import { code200, code400 } from "../responseCode.js";

const handleErrorResponse = (response, status, message) => {
  return response.status(status).json({ success: false, error: message });
};

export const addPassbook = async (request, response) => {
  return false;
  try {
    const passbookData = {
      userId: request.body.userId,
      eventId: request.body.eventId,
      activityId: request.body.activityId,
      entryId: request.body.entryId,
      entryType: request.body.entryType,
      status: request.body.status,
      remarks: request.body.remarks,
      start_at: request.body.start_at,
      end_at: request.body.end_at,
      photo: request.body.photo,
      photo: request.body.photo,
    };

    const savedPassbook = await passbookSchema.create(passbookData);

    response.status(200).json({
      success: true,
      message: "Passbook created successfully",
      id: savedPassbook.id,
    });
  } catch (error) {
    handleErrorResponse(response, 400, error.message);
  }
};

export const updatePassbook = async (request, response) => {
  return false;
  try {
    
    const passbookId = request.params.id;

    const updatedPassbookData = {
      eventId: request.body.eventId,
      assigned_to: request.body.assigned_to,
      status: request.body.status,
      remarks: request.body.remarks,
      start_at: request.body.start_at,
      end_at: request.body.end_at,
      photo: request.body.photo,
    };

    const updatedPassbook = await passbookSchema.findOneAndUpdate(
      { _id: passbookId },
      updatedPassbookData,
      { new: true }
    );

    if (!updatedPassbook) {
      return handleErrorResponse(response, 404, "Passbook entry not found");
    }

    response.status(200).json({
      success: true,
      message: "Passbook updated successfully",
      updatedPassbook,
    });
  } catch (error) {
    handleErrorResponse(response, 400, error.message);
  }
};

export const deletePassbook = async (request, response) => {
  return false;
  try {
    const passbookId = request.params.id;

    const deletedPassbook = await passbookSchema.findByIdAndDelete(passbookId);

    if (!deletedPassbook) {
      return handleErrorResponse(response, 404, "Passbook not found");
    }

    response.status(200).json({
      success: true,
      message: "Passbook deleted successfully",
    });
  } catch (error) {
    handleErrorResponse(response, 400, error.message);
  }
};

export const getSinglePassbookEntry = async (request, response) => {
  const id = request.params.id;
  try {
    const details = await passbookSchema.findById(id);

    if (!details) {
      return response.status(404).json({
        errorCode: code400,
        success: false,
        error: "passbook entry not found",
      });
    }

    response.status(200).json({
      code: code200,
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


export const getAllPassbookEntries = async (request, response) => {
  try {
    const details = await passbookSchema.find();
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

export const getCommonAcoountPassBookEntries = async (request, response) => {
  const userId = request.params.id; // Assuming userId is passed as a parameter

  try {
    // Find all passbook entries for the specified userId
    const entries = await passbookSchema.find({ userId });

    if (!entries || entries.length === 0) {
      return response.status(404).json({
        errorCode: code400,
        success: false,
        error: "Passbook entries not found for the specified user",
      });
    }

    response.status(200).json({
      code: code200,
      success: true,
      message: "Successful",
      data: entries,
    });
  } catch (error) {
    response
      .status(404)
      .json({ errorCode: code400, success: false, error: error.message });
  }
};

