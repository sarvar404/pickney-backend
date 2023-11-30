import eventSchema from "../model/eventSchema.js";
import dotenv from "dotenv";

dotenv.config();

export const addEvent = async (request, response) => {
  try {
    const eventData = {
      name: request.body.name,
      created_by: request.body.created_by,
      stars: request.body.stars,
      type: request.body.type,
      is_recurring: request.body.is_recurring,
      frequency: request.body.frequency,
      tags: request.body.tags,
      start_at: request.body.start_at,
      end_at: request.body.end_at,
      status: request.body.status,
      is_auto_complete: request.body.is_auto_complete,
      max_count: request.body.max_count,
    };

    const savedEvent = await eventSchema.create(eventData);

    response.status(201).json({
      success: true,
      message: "Event created successfully",
      id: savedEvent.id,
    });
  } catch (error) {
    response.status(400).json({ success: false, error: error.message });
  }
};

export const updateEvent = async (request, response) => {
  try {
    const eventId = request.params.id; // Assuming the ID is provided in the URL params

    const updatedEventData = {
      name: request.body.name,
      created_by: request.body.created_by,
      stars: request.body.stars,
      type: request.body.type,
      is_recurring: request.body.is_recurring,
      frequency: request.body.frequency,
      tags: request.body.tags,
      start_at: request.body.start_at,
      end_at: request.body.end_at,
      status: request.body.status,
      is_auto_complete: request.body.is_auto_complete,
      max_count: request.body.max_count,
    };

    const updatedEvent = await eventSchema.findOneAndUpdate(
      { _id: eventId },
      updatedEventData,
      { new: true }
    );

    if (!updatedEvent) {
      return response.status(404).json({
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
    response.status(400).json({ success: false, error: error.message });
  }
};

export const deleteEvent = async (request, response) => {
  try {
    const eventId = request.params.id; // Assuming the ID is provided in the URL params

    const deletedEvent = await eventSchema.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return response.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    response.status(200).json({
      success: true,
      message: "Event deleted successfully"
    });
  } catch (error) {
    response.status(400).json({ success: false, error: error.message });
  }
};
