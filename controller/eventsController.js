import eventSchema from "../model/eventSchema.js";
import grantStarsSchema from "../model/grantStarsSchema.js";
import dotenv from "dotenv";
import { code201, code400 } from "../responseCode.js";

dotenv.config();

export const addEvent = async (request, response) => {
  try {
    const eventData = {
      userId: request.body.userId,
      kidId: request.body.kidId,
      name: request.body.name,
      stars: request.body.stars,
      event_type: request.body.event_type,
      reward_type: request.body.reward_type,
      is_recurring: request.body.is_recurring,
      tags: request.body.tags,
      is_auto_complete_event: request.body.is_auto_complete_event,
      frequency: request.body.frequency,
      max_count: request.body.max_count,
      start_at: request.body.start_at,
      end_at: request.body.end_at,
      status: request.body.status,
      photo: request.body.photo, // Corrected to use request.body.photo
    };

    const savedEvent = await eventSchema.create(eventData);

    response.status(201).json({
      code : code201,
      success: true,
      message: "Event created successfully",
      id: savedEvent.id,
    });
  } catch (error) {
    response.status(400).json({ errorCode : code400, success: false, error: error.message });
  }
};


export const updateEvent = async (request, response) => {
  try {
    const eventId = request.params.id; // Assuming the ID is provided in the URL params

    const updatedEventData = {
      stars: request.body.stars,
      reward_type: request.body.reward_type,
      tags: request.body.tags,
      is_auto_complete_event: request.body.is_auto_complete_event,
      max_count: request.body.max_count,
      start_at: request.body.start_at,
      end_at: request.body.end_at,
      status: request.body.status,
      photo: request.body.photo,
    };

    const updatedEvent = await eventSchema.findOneAndUpdate(
      { _id: eventId },
      updatedEventData,
      { new: true }
    );

    if (!updatedEvent) {
      return response.status(404).json({
        errorCode : code400, 
        success: false,
        message: "Event not found",
      });
    }

    response.status(200).json({
      success: true,
      message: "Event updated successfully",
      updatedEvent,
    });
  } catch (error) {
    response.status(400).json({ errorCode : code400, success: false, error: error.message });
  }
};

export const deleteEvent = async (request, response) => {
  try {
    const eventId = request.params.id; // Assuming the ID is provided in the URL params

    const deletedEvent = await eventSchema.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return response.status(404).json({
        errorCode : code400, 
        success: false,
        message: "Event not found",
      });
    }

    response.status(200).json({
      success: true,
      message: "Event deleted successfully"
    });
  } catch (error) {
    response.status(400).json({ errorCode : code400, success: false, error: error.message });
  }
};


export const grantKid = async (request, response) => {
  try {
    const eventData = {
      userId: request.body.userId,
      kidId: request.body.kidId,
      eventId: request.body.eventId,
      selected_date: request.body.selected_date,
      is_recurring: request.body.is_recurring,
      select_event: request.body.select_event,
      remarks: request.body.remarks,
      select_value: request.body.is_recurring ? 0 : request.body.select_value || 0,
      select_count: request.body.is_recurring ? 0 : request.body.select_count || 0,
    };

    const savedEvent = await grantStarsSchema.create(eventData);

    response.status(201).json({
      code: 201,
      success: true,
      message: "kid granted successfully",
      id: savedEvent.id,
    });
  } catch (error) {
    response.status(400).json({ errorCode : code400, success: false, error: error.message });
  }
};

export const updateGrantedKid = async (request, response) => {
  try {
    const eventId = request.params.id;

    const updatedEventData = {
      selected_date: request.body.selected_date,
      is_recurring: request.body.is_recurring,
      select_event: request.body.select_event,
      remarks: request.body.remarks,
      select_value: request.body.is_recurring ? 0 : request.body.select_value || 0,
      select_count: request.body.is_recurring ? 0 : request.body.select_count || 0,
    };

    const updatedEvent = await grantStarsSchema.findOneAndUpdate(
      { _id: eventId },
      updatedEventData,
      { new: true }
    );

    if (!updatedEvent) {
      return response.status(404).json({
        errorCode : code400, 
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
    response.status(400).json({ errorCode : code400, success: false, error: error.message });
  }
};

export const deleteGrantedKid = async (request, response) => {
  try {
    const eventId = request.params.id;

    const deletedEvent = await grantStarsSchema.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return response.status(404).json({
        errorCode : code400, 
        success: false,
        message: "granted kid list not found",
      });
    }

    response.status(200).json({
      success: true,
      message: "granted kid details deleted successfully",
    });
  } catch (error) {
    response.status(400).json({ errorCode : code400, success: false, error: error.message });
  }
};


export const getSingleEvent = async (request, response) => {
  const id = request.params.id;
  try {
    const details = await eventSchema.findById(id);
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

export const getAllEventList = async (request, response) => {
  try {
    const details = await eventSchema.find();
    const totalRecords = details.length;
    response.status(200).json({
      code: code201,
      success: true,
      message: "Successful",
      totalRecords: totalRecords,
      data: details,
    });
  } catch (err) {
    response.status(404).json({ errorCode: code400, success: false, error: "Not found" });
  }
};
