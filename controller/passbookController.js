import passbookSchema from "../model/passbookSchema.js";

const handleErrorResponse = (response, status, message) => {
  return response.status(status).json({ success: false, error: message });
};

export const addPassbook = async (request, response) => {
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

    response.status(201).json({
      success: true,
      message: "Passbook created successfully",
      id: savedPassbook.id,
    });
  } catch (error) {
    handleErrorResponse(response, 400, error.message);
  }
};

export const updatePassbook = async (request, response) => {
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
