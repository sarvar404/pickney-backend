export const updateGrantedKid = async (request, response) => {
  try {
    const eventId = request.params.id;

    const updatedEventData = {
      selected_date: request.body.selected_date,
      is_recurring: request.body.is_recurring,
      select_event: request.body.select_event,
      remarks: request.body.remarks,
      select_value: request.body.is_recurring
        ? 0
        : request.body.select_value || 0,
      select_count: request.body.is_recurring
        ? 0
        : request.body.select_count || 0,
    };

    const updatedEvent = await grantStarsSchema.findOneAndUpdate(
      { _id: eventId },
      updatedEventData,
      { new: true }
    );

    if (!updatedEvent) {
      return response.status(404).json({
        errorCode: code400,
        success: false,
        message: "granted kid list not found",
      });
    }

    response.status(200).json({
      success: true,
      message: "granted kid details update successfully",
      updatedEvent,
    });
  } catch (error) {
    response
      .status(400)
      .json({ errorCode: code400, success: false, error: error.message });
  }
};

export const deleteGrantedKid = async (request, response) => {
  try {
    const eventId = request.params.id;

    const deletedEvent = await grantStarsSchema.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return response.status(404).json({
        errorCode: code400,
        success: false,
        message: "granted kid list not found",
      });
    }

    response.status(200).json({
      success: true,
      message: "granted kid details deleted successfully",
    });
  } catch (error) {
    response
      .status(400)
      .json({ errorCode: code400, success: false, error: error.message });
  }
};

export const grantStar = async (request, response) => {
  try {
    const eventData = {
      createdBy: request.body.createdBy,
      kidId: request.body.kidId,
      eventId: request.body.eventId,
      is_recurring: request.body.is_recurring,
      select_event: request.body.select_event,
      remarks: request.body.remarks,
      select_value: request.body.is_recurring
        ? 0
        : request.body.select_value || 0,
      select_count: request.body.is_recurring
        ? 0
        : request.body.select_count || 0,
    };

    const savedEvent = await grantStarsSchema.create(eventData);

    response.status(201).json({
      code: 201,
      success: true,
      message: "kid granted successfully",
      id: savedEvent.id,
    });
  } catch (error) {
    response
      .status(400)
      .json({ errorCode: code400, success: false, error: error.message });
  }
};
