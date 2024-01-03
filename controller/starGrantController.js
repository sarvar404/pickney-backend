import { StarType, is_credit, is_debit } from "../contentId.js";
import { getEventStars } from "../helper_function.js";
import eventSchema from "../model/eventSchema.js";
import grantStarsSchema from "../model/grantStarsSchema.js";
import passbookSchema from "../model/passbookSchema.js";
import { code200, code400 } from "../responseCode.js";

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

export const updateEvent = async (data, callback) => {
  try {
    const eventId = data.eventId;
    
    const stars = await getEventStars(eventId);

    let totalStars = 0;

    if (data.event_type === is_credit) {
      totalStars = stars + data.values;
    } else if (data.event_type === is_debit) {
      totalStars = stars - data.values;
    }

    

    const updatedEventData = {
      stars: totalStars,
    };

    const updatedEvent = await eventSchema.findOneAndUpdate(
      { _id: eventId },
      updatedEventData,
      { new: true }
    );

    if (updatedEvent) {
      const passbookResult = await addPassbook(data);
      callback({ success: true, message: "Event updated successfully", updatedEvent, passbookResult });
    } else {
      throw new Error("Event not found");
    }
  } catch (error) {
    callback({ errorCode: code400, success: false, error: error.message });
  }
};

export const addPassbook = async (data) => {
  try {
    
    const stars = await getEventStars(data.eventId);
    const passbookData = {
      userId: data.createdBy,
      entryId: data._id,
      entryType: StarType, // Assuming StarType is defined somewhere
      status: "STAR GRANTED",
      remarks: data.remarks,
      balance_stars: stars,
      photo: "http://dummy.jpg",
      is_credit: data.event_type, // Assuming is_credit is defined somewhere
    };

    const savedPassbook = await passbookSchema.create(passbookData);

    return {
      success: true,
      message: "Passbook created successfully",
      id: savedPassbook.id,
    };
  } catch (error) {
    return { errorCode: code400, success: false, error: error.message };
  }
};

export const grantStar = async (request, response) => {
  try {
    const starGrantedData = {
      createdBy: request.body.createdBy,
      kidId: request.body.kidId,
      eventId: request.body.eventId,
      event_name: request.body.event_name,
      event_type: request.body.event_type,
      is_recurring: request.body.is_recurring,
      values: request.body.values,
      remarks: request.body.remarks,
    };

    const starGranted = await grantStarsSchema.create(starGrantedData);

    if (starGranted) {
      updateEvent(starGranted, (result) => {
        if (result.success) {
          response.status(200).json({
            code: code200,
            success: true,
            message: "Star granted successfully",
            id: starGranted.id,
            passbookResult: result.passbookResult,
          });
        } else {
          response.status(400).json(result);
        }
      });
    }
  } catch (error) {
    response.status(400).json({ errorCode: code400, success: false, error: error.message });
  }
};


