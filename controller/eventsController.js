import moment from "moment/moment.js";
import eventSchema from "../model/eventSchema.js";
import defaultEventSchema from "../model/defaultEventSchema.js";
import grantStarsSchema from "../model/grantStarsSchema.js";
import activitySchema from "../model/activitySchema.js";
import dotenv from "dotenv";
import { code200, code400 } from "../responseCode.js";
import { is_active } from "../contentId.js";
import tagSchema from "../model/tagSchema.js";
import mongoose from "mongoose";
import _ from "lodash";

dotenv.config();

export const updateEvent = async (request, response) => {
  try {
    // const eventId = request.params.id; // Assuming the ID is provided in the URL params
    const eventId = request.body.id;

    const existingActivities = await activitySchema.find({ eventId });
    if (existingActivities) {
      await activitySchema.deleteMany({ eventId });
    }

    const updatedEventData = {
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
      photo: request.body.photo,
    };

    const updatedEvent = await eventSchema.findOneAndUpdate(
      { _id: eventId },
      updatedEventData,
      { new: true }
    );

    if (!updatedEvent) {
      return response.status(404).json({
        errorCode: code400,
        success: false,
        message: "Event not found",
      });
    } else {
      await addActivity(updatedEvent); // Await the addActivity function

      response.status(200).json({
        success: true,
        message: "Event updated successfully",
        updatedEvent,
      });
    }
  } catch (error) {
    response
      .status(400)
      .json({ errorCode: code400, success: false, error: error.message });
  }
};

export const deleteEvent = async (request, response) => {
  try {
    const eventId = request.params.id; // Assuming the ID is provided in the URL params
    await activitySchema.deleteMany({ eventId });
    const deletedEvent = await eventSchema.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return response.status(404).json({
        errorCode: code400,
        success: false,
        message: "Event not found",
      });
    }

    response.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    response
      .status(400)
      .json({ errorCode: code400, success: false, error: error.message });
  }
};

export const getTagDetailsByIds = async (tagIds) => {
  try {
    const tagDetails = await tagSchema.find({ _id: { $in: tagIds } });
    return tagDetails;
  } catch (error) {
    throw new Error(`Failed to fetch tag details: ${error.message}`);
  }
};

export const getSingleEvent = async (request, response) => {
  const eventId = request.params.id;

  try {
    // Find the event details
    const eventDetails = await eventSchema.findById(eventId);

    if (!eventDetails) {
      return response.status(404).json({
        errorCode: code400,
        success: false,
        error: "Event not found",
      });
    }

    // Fetch tag details based on tag ids
    const tagDetails = await getTagDetailsByIds(eventDetails.tags);

    // Fetch activities based on the event ID
    const activities = await activitySchema.find({ eventId });

    response.status(200).json({
      code: code200,
      success: true,
      message: "Successful",
      event: { ...eventDetails._doc, tags: tagDetails }, // Combine event details with tag details
      activities,
    });
  } catch (error) {
    response.status(500).json({
      errorCode: code400,
      success: false,
      error: error.message,
    });
  }
};

export const getAllEventList = async (request, response) => {
  try {
    const details = await eventSchema.find();

    // Fetch tag details for each event
    const eventsWithTags = await Promise.all(
      details.map(async (event) => {
        const tagDetails = await getTagDetailsByIds(event.tags);
        return { ...event._doc, tags: tagDetails };
      })
    );

    const totalRecords = eventsWithTags.length;

    response.status(200).json({
      code: code200,
      success: true,
      message: "Successful",
      totalRecords: totalRecords,
      data: eventsWithTags,
    });
  } catch (err) {
    response
      .status(404)
      .json({ errorCode: code400, success: false, error: "Not found" });
  }
};

export const getActivitiesByDate = async (request, response) => {
  try {
    const startDate = moment(request.body.checkByDate, "DD/MM/YYYY");
    const is_recurring = request.body.is_recurring;

    const events = await eventSchema.find({
      start_at: { $lte: startDate.endOf("day").toDate() },
      is_recurring: is_recurring,
      status: 1,
    });

    // Fetch tag details for each event
    const eventsWithTags = await Promise.all(
      events.map(async (event) => {
        const tagDetails = await getTagDetailsByIds(event.tags);
        return { ...event._doc, tags: tagDetails };
      })
    );

    response.status(200).json({
      code: code200,
      success: true,
      message: "Events fetched successfully",
      events: eventsWithTags,
    });
  } catch (error) {
    response.status(500).json({
      errorCode: code400,
      success: false,
      error: error.message,
    });
  }
};

export const addActivityCronJob = async (data) => {
  try {
    const activityData = {
      eventId: data._id,
      userId: data.userId,
      kidId: data.kidId,
      activity_name: data.name,
      status: data.status,
      remarks: undefined,
      start_at: data.start_at,
      end_at: data.end_at,
      photo: "https://photos.google.com",
    };

    const savedActivity = await activitySchema.create(activityData);

    return {
      code: code200,
      success: true,
      message: "activity created successfully",
    };
  } catch (error) {
    return {
      errorCode: code400,
      success: false,
      error: error.message,
    };
  }
};

export const addActivity = async (event) => {
  try {
    for (let index = 0; index < event.max_count; index++) {
      const activityData = {
        eventId: event._id,
        userId: event.userId,
        kidId: event.kidId,
        activity_name: event.name,
        status: event.status,
        remarks: undefined,
        start_at: event.start_at,
        end_at: event.end_at,
        photo: "https://photos.google.com",
      };

      const savedActivity = await activitySchema.create(activityData);
    }

    return {
      code: code200,
      success: true,
      message: "Activities created successfully",
    };
  } catch (error) {
    return {
      errorCode: code400,
      success: false,
      error: error.message,
    };
  }
};

const createEventData = (body) => {
  return {
    userId: body.userId,
    kidId: body.kidId,
    name: body.name,
    stars: body.stars,
    event_type: body.event_type,
    reward_type: body.reward_type,
    is_recurring: body.is_recurring,
    tags: body.tags,
    is_auto_complete_event: body.is_auto_complete_event,
    photo: body.photo,
  };
};

// adding event with types

const oneTimeEvent = async (body, response) => {
  try {
    const currentDateFormatted = moment().format("DD/MM/YYYY");
    
    const eventData = {
      ...createEventData(body),
      frequency: "D",
      max_count: 1,
      start_at: currentDateFormatted,
      end_at: currentDateFormatted,
      status: 1,
    };

    const savedEvent = await eventSchema.create(eventData);

    if (savedEvent) {
      await addActivity(savedEvent);
    }

    response.status(200).json({
      code: code200,
      success: true,
      message: "Event created successfully",
      id: savedEvent.id,
    });
  } catch (error) {
    response.status(400).json({
      errorCode: code400,
      success: false,
      error: "Internal Server Error",
    });
  }
};

const endAtDateGenerator = async (start_at, frequency) => {
  let startDate;
  let endDate;

  if (frequency === "D") {
    startDate = moment(start_at, "DD/MM/YYYY"); // Start one day ahead of the current date
    endDate = startDate.clone(); // endDate is three days ahead of startDate
  } else if (frequency === "W") {
    startDate = moment(start_at, "DD/MM/YYYY");
    endDate = startDate.clone().endOf("isoWeek").isoWeekday(7);
  } else if (frequency === "M") {
    startDate = moment(start_at, "DD/MM/YYYY");
    endDate = startDate.clone().endOf("month");
  }

  return endDate;
};

const recurringEvent = async (body, response) => {
  try {
    const endDate = await endAtDateGenerator(body.start_at, body.frequency);
    // console.log(endDate.clone().format("DD/MM/YYYY"));
    // process.exit();
    const eventData = {
      ...createEventData(body),
      frequency: body.frequency,
      max_count: body.max_count,
      start_at: body.start_at,
      end_at: endDate.clone().format("DD/MM/YYYY"),
      status: 1,
    };

    const savedEvent = await eventSchema.create(eventData);

    if (savedEvent) {
      await addActivity(savedEvent);
    }

    response.status(200).json({
      code: code200,
      success: true,
      message: "Event created successfully",
      id: savedEvent.id,
    });
  } catch (error) {
    console.error("Error in recurringEvent:", error);
    response.status(400).json({
      errorCode: code400,
      success: false,
      error: "Internal Server Error",
    });
  }
};


export const addEvent = async (request, response) => {
  try {
    const eventType = request.body.event_type;

    if (eventType === false) {
      await oneTimeEvent(request.body, response);
    } else if (eventType === true) {
      await recurringEvent(request.body, response);
    } else {
      return response.status(400).json({
        errorCode: code400,
        success: false,
        error: "Invalid event type.",
      });
    }
  } catch (error) {
    console.error("Error in addEvent:", error);
    response.status(400).json({
      errorCode: code400,
      success: false,
      error: "Internal Server Error",
    });
  }
};

// DEFAULT ................

export const addEventDefault = async (request, response) => {
  try {
    const eventData = {
      name: request.body.name,
      points: request.body.points,
      event_type: request.body.event_type,
      is_recurring: request.body.is_recurring,
      frequency: request.body.frequency,
      tags: request.body.tags,
      photo: request.body.photo,
      is_recommended: request.body.is_recommended,
      status: request.body.status,
    };

    const savedEvent = await defaultEventSchema.create(eventData);

    response.status(200).json({
      code: code200,
      success: true,
      message: "Event created successfully",
      id: savedEvent.id,
    });
  } catch (error) {
    response
      .status(400)
      .json({ errorCode: code400, success: false, error: error.message });
  }
};

export const updateEventDefault = async (request, response) => {
  try {
    const eventId = request.params.id; // Assuming the ID is provided in the URL params

    const updatedEventData = {
      points: request.body.points,
      event_type: request.body.event_type,
      is_recurring: request.body.is_recurring,
      frequency: request.body.frequency,
      tags: request.body.tags,
      photo: request.body.photo,
      is_recommended: request.body.is_recommended,
      status: request.body.status,
    };

    const updatedEvent = await defaultEventSchema.findOneAndUpdate(
      { _id: eventId },
      updatedEventData,
      { new: true }
    );

    if (!updatedEvent) {
      return response.status(404).json({
        errorCode: code400,
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
    response
      .status(400)
      .json({ errorCode: code400, success: false, error: error.message });
  }
};

export const deleteEventDefault = async (request, response) => {
  try {
    const eventId = request.params.id; // Assuming the ID is provided in the URL params

    const deletedEvent = await defaultEventSchema.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return response.status(404).json({
        errorCode: code400,
        success: false,
        message: "Event not found",
      });
    }

    response.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    response
      .status(400)
      .json({ errorCode: code400, success: false, error: error.message });
  }
};

// get events for star granted...

export const getOnetimeEvents = async (request, response) => {
  const { userId, kidId, created_at, is_auto_complete_event, status } = request.body;

  // Validate required fields
  if (!userId || !kidId || !created_at || is_auto_complete_event === undefined) {
    return response.status(400).json({
      errorCode: code400,
      success: false,
      error: "Missing required fields: userId, kidId, created_at, is_auto_complete_event, status",
    });
  }

  try {
    // Find the event details based on userId, kidId, created_at, is_auto_complete_event, and status
    const eventDetails = await eventSchema.find({
      userId,
      kidId,
      event_type: false,
      created_at: { $lte: moment(created_at, 'DD/MM/YYYY').endOf('day').toDate() },
      is_auto_complete_event,
      status : 1,
    });

    if (!eventDetails || eventDetails.length === 0) {
      return response.status(404).json({
        errorCode: code400,
        success: false,
        error: "No one-time events found for the specified user, kid, date, is_auto_complete_event, and status",
      });
    }

    // Fetch tag details for each event based on tag ids
    const eventsWithTags = await Promise.all(eventDetails.map(async (event) => {
      const tagDetails = await getTagDetailsByIds(event.tags);
      return { ...event._doc, tags: tagDetails };
    }));

    response.status(200).json({
      code: code200,
      success: true,
      message: "Successful",
      events: eventsWithTags,
    });
  } catch (error) {
    response.status(500).json({
      errorCode: code400,
      success: false,
      error: error.message,
    });
  }
};

export const getEventActivities = async (eventId) => {
  try {

    const activities = await activitySchema.aggregate([
      {
        $match: {
          eventId: eventId,
        },
      },
      {
        $set: {
          eventId: {
            $convert: {
              input: "$eventId",
              to: "objectId",
            },
          },
        },
      },
      {
        $group: {
          _id: "$eventId",
          activities: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          eventId: "$_id",
          activities: 1,
        },
      },
    ]);

    return _.get(activities, "[0].activities", []);
  } catch (error) {
    console.error('Error in getEventActivities:', error.message);
    throw new Error(error.message);
  }
};




export const getRecurringEvents = async (request, response) => {
  const { userId, kidId, created_at, is_auto_complete_event, status } = request.body;

  // Validate required fields
  if (!userId || !kidId || !created_at || is_auto_complete_event === undefined) {
    return response.status(400).json({
      errorCode: code400,
      success: false,
      error: "Missing required fields: userId, kidId, created_at, is_auto_complete_event, status",
    });
  }

  try {
    // Find the event details based on userId, kidId, created_at, is_auto_complete_event, and status
    const eventDetails = await eventSchema.find({
      userId,
      kidId,
      event_type: true,
      created_at: { $lte: moment(created_at, 'DD/MM/YYYY').endOf('day').toDate() },
      is_auto_complete_event,
      status: 1,
    });

    if (!eventDetails || eventDetails.length === 0) {
      return response.status(404).json({
        errorCode: code400,
        success: false,
        error: "No one-time events found for the specified user, kid, date, is_auto_complete_event, and status",
      });
    }

    // Fetch tag details for each event based on tag ids
    const eventsWithActivities = await Promise.all(eventDetails.map(async (event) => {
      const tagDetails = await getTagDetailsByIds(event.tags);
      const activities = await getEventActivities(event._id);
      return { ...event._doc, tags: tagDetails, activities };
    }));

    response.status(200).json({
      code: code200,
      success: true,
      message: "Successful",
      events: eventsWithActivities,
    });
  } catch (error) {
    response.status(500).json({
      errorCode: code400,
      success: false,
      error: error.message,
    });
  }
};



