import moment from "moment";
import eventSchema from "./model/eventSchema.js";
import activitySchema from "./model/activitySchema.js";
import kidBalanceSchema from "./model/kidBalanceSchema.js";
import { is_credit, is_debit } from "./contentId.js";

export const calculateEmiDates = (endDate, duration) => {
  const emiDates = [];
  const endDateMoment = moment(endDate, "DD/MM/YYYY");

  // Calculate EMI dates based on duration
  for (let i = 0; i < duration; i++) {
    const emiDate = endDateMoment
      .clone()
      .subtract(i, "months")
      .format("DD/MM/YYYY");

    emiDates.push(emiDate);
  }

  return emiDates;
};


export const calculateDynamicEmiDates = (duration) => {
  const emiDates = [];
  const endDateMoment = moment();

  // Calculate EMI dates based on duration
  for (let i = 1; i <= duration; i++) {
    const emiDate = endDateMoment
      .clone()
      .add(i, "months")
      .format("DD/MM/YYYY");

    emiDates.push(emiDate);
  }

  return emiDates;
};

export const getEventStars = async (eventId) => {
  try {
    const eventDetails = await eventSchema.findById({ _id: eventId });

    if (!eventDetails) {
      throw new Error("Event not found");
    }

    // console.log("Stars from getEventStars:", eventDetails.stars); // Add this line for debugging

    return eventDetails.stars;
  } catch (error) {
    throw new Error(`Error getting event stars: ${error.message}`);
  }
}

export const getEventDetails = async (eventId) => {
  try {
    const eventDetails = await eventSchema.findById({ _id: eventId });

    if (!eventDetails) {
      throw new Error("Event not found");
    }

    // console.log("Stars from getEventStars:", eventDetails.stars); // Add this line for debugging

    return eventDetails;
  } catch (error) {
    throw new Error(`Error getting event stars: ${error.message}`);
  }
}

export const getTotalBalance = async (userId, kidId) => {
  try {
    const kidBalanceDetails = await kidBalanceSchema.findOne({ userId, kidId });

    if (!kidBalanceDetails) {
      return 0; // Return zero if kid balance record is not found
    }

    // console.log("Available Balance:", kidBalanceDetails.available_balance); // Add this line for debugging

    return kidBalanceDetails.available_balance;
  } catch (error) {
    throw new Error(`Error getting available balance: ${error.message}`);
  }
};

// total ammount for kids helper
export const updateOrCreateKidBalance = async (userId, kidId, available_balance, type) => {
  try {
    // Check if kid balance already exists for the userId and kidId
    const existingKidBalance = await kidBalanceSchema.findOne({ userId, kidId });
    if (existingKidBalance) {
      // Update available_balance based on the type
      if (type === is_credit) {
        existingKidBalance.available_balance += available_balance;
      } else if (type === is_debit) {
        existingKidBalance.available_balance -= available_balance;
      }

      // Save the updated kid balance
      await existingKidBalance.save();

      return existingKidBalance; // Return the updated kid balance
    } else {
      // Create a new kid balance record if it doesn't exist
      let final_availableBalance = available_balance;

      if (type === is_debit) {
        // Set the initial available_balance to the negative value if is_debit
        final_availableBalance *= -1;
      }

      const newKidBalance = await kidBalanceSchema.create({
        userId,
        kidId,
        available_balance: final_availableBalance,
      });

      return newKidBalance; // Return the newly created kid balance
    }
  } catch (error) {
    throw new Error(`Failed to update or create kid balance: ${error.message}`);
  }
};


export const balanceCanWithdraw = async (userId, kidId, amount) => {
  try {
    const kidBalanceDetails = await kidBalanceSchema.findOne({ userId, kidId });

    if (!kidBalanceDetails) {
      throw new Error("Kid balance not found");
    }

    // Return true if the available balance is sufficient, otherwise, return false
    return kidBalanceDetails.available_balance >= amount;
  } catch (error) {
    throw new Error(`Error checking balance for withdrawal: ${error.message}`);
  }
};


export const updateEventStatus = async (eventId) => {
  try {
    // Find the event by _id and update its status to 2
    const updatedEvent = await eventSchema.findOneAndUpdate(
      { _id: eventId },
      { status: 2 },
      { new: true }
    );

    if (!updatedEvent) {
      // If no event is found with the given _id, throw an error
      throw new Error('Event not found');
    }

    // Return the updated event
    return updatedEvent;
  } catch (error) {
    // If there is an error, throw an error with a meaningful message
    throw new Error(`Error updating event status: ${error.message}`);
  }
};

export const updateActivity = async (_id) => {
  try {
    // Find the event by _id and update its status to 2
    const updatedActivity = await activitySchema.findOneAndUpdate(
      { _id },
      { status: 2 },
      { new: true }
    );

    if (!updatedActivity) {
      // If no event is found with the given _id, throw an error
      throw new Error('Activity not found');
    }

    // Return the updated activity
    return updatedActivity;
  } catch (error) {
    // If there is an error, throw an error with a meaningful message
    throw new Error(`Error updating activity status: ${error.message}`);
  }
};


export const doesEventExistWithStatus = async (eventId) => {
  try {
    // Find the event by _id and status 1
    const existingEvent = await eventSchema.findOne({ _id: eventId, status: 1 });

    // Return true if the event exists with status 1, otherwise, return false
    return !!existingEvent;
  } catch (error) {
    // If there is an error, return false
    return false;
  }
};

export const doesActivityExist = async (activityId) => {
  try {
    // Find the activity by _id and status 1
    const existingActivity = await activitySchema.findOne({ _id: activityId, status: 1 });

    // Return true if the activity exists with status 1, otherwise, return false
    return !!existingActivity;
  } catch (error) {
    // If there is an error, return false
    return false;
  }
};



export const getCountedActivities = async (eventId) => {
  try {
    // Count the number of activities with status 1 for the given eventId
    const totalActivities = await activitySchema.countDocuments({
      eventId: eventId,
      status: 1,
    });

    return totalActivities;
  } catch (error) {
    // If there is an error, throw an error with a meaningful message
    throw new Error(`Error getting total activities: ${error.message}`);
  }
};












