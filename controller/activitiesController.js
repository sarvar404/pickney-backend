import activitySchema from "../model/activitySchema.js";

export const addActivity = async (request, response) => {
  // console.log(request.body);
  // process.exit();
  try {
    const activityData = {
      eventId: request.body.eventId,
      assigned_to: request.body.assigned_to,
      status: request.body.status,
      remarks: request.body.remarks,
      start_at: request.body.start_at,
      end_at: request.body.end_at,
      photo: request.body.photo,
    };

    const savedActivity = await activitySchema.create(activityData);

    response.status(201).json({
      success: true,
      message: "Activity created successfully",
      id: savedActivity.id,
    });
  } catch (error) {
    response.status(400).json({ errorCode : 400, success: false, error: error.message });
  }
};

export const updateActivity = async (request, response) => {
  try {
    const activityId = request.params.id;

    const updatedActivityData = {
      status: request.body.status
    };

    const updatedActivity = await activitySchema.findOneAndUpdate(
      { _id: activityId },
      updatedActivityData,
      { new: true }
    );

    if (!updatedActivity) {
      return response.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    response.status(200).json({
      success: true,
      message: "Activity updated successfully",
      updatedActivity,
    });
  } catch (error) {
    response.status(400).json({ errorCode : 400, success: false, error: error.message });
  }
};

export const deleteActivity = async (request, response) => {
  try {
    return false;
    const activityId = request.params.id;

    const deletedActivity = await activitySchema.findByIdAndDelete(activityId);

    if (!deletedActivity) {
      return response.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    response.status(200).json({
      success: true,
      message: "Activity deleted successfully",
    });
  } catch (error) {
    response.status(400).json({ errorCode : 400, success: false, error: error.message });
  }
};
