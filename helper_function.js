import moment from "moment";

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
