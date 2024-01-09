import { StarType, is_credit, is_debit } from "../contentId.js";
import {
  balanceCanWithdraw,
  doesActivityExist,
  doesEventExistWithStatus,
  getCountedActivities,
  getEventStars,
  getTotalBalance,
  updateActivity,
  updateEventStatus,
  updateOrCreateKidBalance,
} from "../helper_function.js";
import eventSchema from "../model/eventSchema.js";
import grantStarsSchema from "../model/grantStarsSchema.js";
import passbookSchema from "../model/passbookSchema.js";
import { code200, code400 } from "../responseCode.js";
import { getEventActivities } from "./eventsController.js";

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

// KEEP THIS ASIDE FOR NOW
export const updateEvent = async (data, callback) => {
  return false;
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
      callback({
        success: true,
        message: "Event updated successfully",
        updatedEvent,
        passbookResult,
      });
    } else {
      throw new Error("Event not found");
    }
  } catch (error) {
    callback({ errorCode: code400, success: false, error: error.message });
  }
};

export const addPassbook = async (data, grantedData,activityId, callback) => {
  try {
    const getAvailableBalance = await getTotalBalance(data.userId, data.kidId);

    const passbookData = {
      userId: grantedData.createdBy,
      entryId: grantedData._id,
      entryType: "StarType", // Assuming StarType is defined somewhere
      status: `STAR GRANTED FOR ${grantedData.event_name}`,
      remarks: grantedData.remarks,
      balance_stars: grantedData.values,
      available_balance: getAvailableBalance
        ? getAvailableBalance.available_balance
        : 0,
      photo: "http://dummy.jpg",
      is_credit: grantedData.reward_type, // Assuming is_credit is defined somewhere
    };

    const savedPassbook = await passbookSchema.create(passbookData);

    if (savedPassbook) {
      // It will check all the activities done or not.
      // if not then wont update status 2 for event.

      const total = await getCountedActivities(grantedData.eventId);

      // console.log(total);
      if (total <= 1) {
        await updateActivity(activityId);
        await updateEventStatus(grantedData.eventId);
      } else {
        await updateActivity(activityId);
      }
    }

    const response = {
      success: true,
      message: "granted process done successfully",
    };

    callback(response);
  } catch (error) {
    const response = {
      errorCode: code400,
      success: false,
      error: error.message,
    };
    callback(response);
  }
};

export const grantStar = async (request, response) => {
  try {
    const { event_type, reward_type, createdBy, kidId, eventId, values, activityId } =
      request.body;

    const eventExistsWithStatus = await doesEventExistWithStatus(eventId);

    if (!eventExistsWithStatus) {
      return response.status(400).json({
        errorCode: code400,
        success: false,
        error: "Event not found or does not have status 1",
      });
    }

    const activityExistorNot = await doesActivityExist(activityId);

    if (!activityExistorNot) {
      return response.status(400).json({
        errorCode: code400,
        success: false,
        error: "Activity not found or does not have status 1",
      });
    }

    if (reward_type === is_debit) {
      const amountIsSufficient = await balanceCanWithdraw(
        createdBy,
        kidId,
        values
      );
      if (!amountIsSufficient) {
        return response.status(400).json({
          errorCode: code400,
          success: false,
          error: "Insufficient balance",
        });
      }
    }

    const starGrantedData = {
      createdBy,
      kidId,
      eventId,
      event_name: request.body.event_name,
      event_type,
      reward_type: reward_type,
      values,
      remarks: request.body.remarks,
    };

    const starGranted = await grantStarsSchema.create(starGrantedData);

    if (starGranted) {
      const isTotalDone = await updateOrCreateKidBalance(
        starGranted.createdBy,
        starGranted.kidId,
        starGranted.values,
        starGranted.reward_type
      );
      if (isTotalDone) {
        await addPassbook(isTotalDone, starGranted,activityId, (passbookResponse) => {
          response.status(200).json(passbookResponse);
        });
      }
    }
  } catch (error) {
    response
      .status(400)
      .json({ errorCode: code400, success: false, error: error.message });
  }
};
