import moment from "moment";
import eventSchema from "./model/eventSchema.js";
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

// export const calculateDynamicEmiDates = (endDate, duration) => {
//   const emiDates = [];
//   const endDateMoment = moment(endDate, "DD/MM/YYYY");
//   const currentMonth = moment().month() + 1; // Get the current date

//   // console.log(endDate)
//   // console.log(endDateMoment.month() + 1)
//   // console.log(currentMonth.month() + 1);
//   // console.log(currentMonth.date() + 1);
//   // console.log(currentMonth.year() + 1);

//   const monthsToAdd = Math.floor((endDateMoment.month() + 1) / duration);

//   console.log(monthsToAdd);

//   return emiDates;
// };

// export const calculateDynamicEmiDates = (endDate, duration) => {
//   const endDateMoment = moment(endDate, "DD/MM/YYYY");
//   const currentMonth = moment().month() + 1; // Get the current month (1-indexed)

//   // Convert December to 1, January to 12, February to 11, and so on
//   const adjustedMonth = currentMonth === 12 ? 1 : 13 - currentMonth;

//   // Continue with your code using the adjustedMonth
//   // ...

//   console.log("Adjusted Month:", adjustedMonth);
//   const monthsToAdd = Math.floor((endDateMoment.month() + 1) / duration);
//   console.log(monthsToAdd);
// };

// // Example usage
// calculateDynamicEmiDates("2023-12-31", 12);


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



