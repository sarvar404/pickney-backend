app.put("/status", async (request, response) => {
  try {
    const currentDate = moment();

    // Find activities where end_at is on or before the current date and status is 1
    const activitiesToUpdate = await activitySchema.find({
      end_at: { $lte: currentDate.format("DD/MM/YYYY") },
      status: 1,
    });

    // Update the status of matching activities to 2 (inactive)
    const updatePromises = activitiesToUpdate.map(async (activity) => {
      await activitySchema.updateOne({ _id: activity._id }, { status: 2 });
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    response.status(200).json({
      success: true,
      message: "Activity statuses updated successfully",
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/testing123", async (request, response) => {
  try {
    // console.log("get called");
    // Get all fixed deposits whose maturity date is today or has already passed
    const today = moment().format("MM/DD/YYYY");
    const depositsToMature = await fixedDepositSchema.find({
      $or: [
        { end_at: today },
        { end_at: { $lt: today } }, // Check for past dates
        { status: "ONGOING" }, // Check for "ONGOING" status
      ],
      status: { $ne: "MATURED" }, // Exclude records with "MATURED" status
    });

    for (const deposit of depositsToMature) {
      if (deposit.status === "CANCELLED") {
        // Update the status for addFixedDepositLog and addPassbook
        const cancelledStatus = "CANCELLED";

        // Add the fixed deposit to the logs
        addFixedDepositLog(
          {
            fdId: deposit._id,
            principal: deposit.principal,
            status: cancelledStatus,
          },
          (logResponse) => {
            // console.log(logResponse);
          }
        );

        // Add an entry to the passbook
        addPassbook(
          {
            userId: deposit.userId,
            entryId: deposit._id,
            status: cancelledStatus,
            balance_stars: deposit.principal,
          },
          (passbookResponse) => {
            // console.log(passbookResponse);
          }
        );

        // console.log(`Fixed Deposit ${deposit._id} is cancelled.`);
      } else if (deposit.status === "ONGOING") {
        // Update the status of the fixed deposit
        deposit.status = fdStatus_MATURED;
        const doneDeposit = await deposit.save();

        if (doneDeposit) {
          const isTotalDone = await updateOrCreateKidBalance(
            doneDeposit.userId,
            doneDeposit.kidId,
            doneDeposit.principal,
            is_credit
          );

          if (isTotalDone) {
            // Add the fixed deposit to the logs
            addFixedDepositLog(
              {
                fdId: doneDeposit._id,
                principal: doneDeposit.principal,
                status: fdStatus_MATURED,
              },
              (logResponse) => {
                // console.log(logResponse);
              }
            );

            // Add an entry to the passbook
            addPassbook(
              {
                userId: doneDeposit.userId,
                entryId: doneDeposit._id,
                status: doneDeposit.status,
                balance_stars: doneDeposit.principal,
                available_balance: isTotalDone.available_balance,
              },
              (passbookResponse) => {
                // console.log(passbookResponse);
              }
            );
          }
        }

        // console.log(`Fixed Deposit ${deposit._id} has matured.`);
      }
    }
  } catch (error) {
    console.error("Cron Job Error:", error.message);
  }
});
app.post("/testing", async (req, res) => {
    try {
      const totalEvents = await eventSchema.find();
  
      for (const event of totalEvents) {
        if (
          event.is_recurring &&
          event.status === 1 &&
          event.is_auto_complete_event === true
        ) {
          switch (event.frequency) {
            case "D":
              await processDailyEvent(event);
              break;
            case "W":
              await processWeeklyEvent(event);
              break;
            case "M":
              await processMonthlyEvent(event);
              break;
            default:
              console.error(`Unsupported frequency: ${event.frequency}`);
          }
        }
      }
  
      // console.log("Cron job completed");
      res.status(200).json({ success: true, message: "Cron job completed" });
    } catch (error) {
      // console.error("Cron Job Error:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  });
