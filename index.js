import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import axios from "axios";
import fs from "fs";

// external imports
import cookieParser from "cookie-parser";
import Connection from "./database/db.js";
import multer from "multer";
import azure from "azure-storage";
//
import cron from "node-cron";
import moment from "moment";

// external imports
// import userRouter from "./routes/users.js"
import eventsRouter from "./routes/events.js";
import activitiesRouter from "./routes/activities.js";
import tagsRouter from "./routes/tags.js";
import devicesRouter from "./routes/devices.js";
import usersRouter from "./routes/users.js";
import kidsRouter from "./routes/kids.js";
import fixedDepositRouter from "./routes/fixed-deposit.js";
import fixedDepositLogsRouter from "./routes/fixed-deposit-logs.js";
import loanRouter from "./routes/loan.js";
import loanLogsRouter from "./routes/loan-logs.js";
import { EventsImage, commonImage } from "./storageFileEnums.js";
import { authSecurityHeader } from "./middlewares/middlewareAuth.js";
import { addFixedDepositLog } from "./controller/fixedDepositController.js";

// model
import fixedDepositSchema from "./model/fixedDepositSchema.js";
import eventSchema from "./model/eventSchema.js";
// enums
import { fdStatus_MATURED, is_active, is_credit } from "./contentId.js";
import { addActivityCronJob } from "./controller/eventsController.js";
import activitySchema from "./model/activitySchema.js";
import { updateOrCreateKidBalance } from "./helper_function.js";
import { addPassbook } from "./controller/passbookController.js";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

dotenv.config();
const app = express();
// app.use(morgan("dev"));
const PORT = process.env.PORT || 8000;
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
const corsOptions = {
  origin: true,
  methods: ["*"], // Allow all methods
  credentials: true,
};
// middleware
// we have use body parser here to see the output in console
app.use(bodyParser.json({ extended: true }));
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// app.use(express.json());
app.use(express.json({ limit: "50mb" }));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.static("public"));

app.get("/", async (request, response) => {
  response.send("Cookies cleared and APIs working");
});

app.use("/api", eventsRouter);
app.use("/api", activitiesRouter);
app.use("/api", tagsRouter);
app.use("/api", devicesRouter);
app.use("/api", usersRouter);
app.use("/api", kidsRouter);
app.use("/api", fixedDepositRouter);
app.use("/api", loanRouter);
app.use("/api", loanLogsRouter);
app.use("/api", fixedDepositLogsRouter);

// Uploading APIs
const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const storageAccountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
// const containerName = commonImage; // Replace with your container name
const blobService = azure.createBlobService(
  storageAccountName,
  storageAccountKey
);

app.post(
  "/api/upload/common-profile",
  authSecurityHeader,
  upload.single("ps-img"),
  (req, res) => {
    try {
      const blobName = generateBlobName(req.file.originalname);
      const stream = fs.createReadStream(req.file.path);
      const streamLength = req.file.size;

      // Set the content type of the blob
      const options = {
        contentSettings: {
          contentType: req.file.mimetype,
        },
      };

      blobService.createBlockBlobFromStream(
        commonImage,
        blobName,
        stream,
        streamLength,
        options,
        (error, result, response) => {
          if (!error) {
            // Generate a SAS token with read permission
            const startDate = new Date();
            const expiryDate = new Date(startDate);
            expiryDate.setMinutes(startDate.getMinutes() + 30); // Set the expiration time to 30 minutes from now

            const sharedAccessPolicy = {
              AccessPolicy: {
                Permissions: azure.BlobUtilities.SharedAccessPermissions.READ,
                Start: startDate,
                Expiry: expiryDate,
              },
            };

            const sasToken = blobService.generateSharedAccessSignature(
              commonImage,
              blobName,
              sharedAccessPolicy
            );

            // Construct the URL with the SAS token
            const imageUrl = blobService.getUrl(
              commonImage,
              blobName
              // sasToken
            );
            return res.status(200).json({
              success: true,
              message: "File uploaded successfully",
              imageUrl,
            });
          } else {
            return res.status(500).json({
              success: false,
              message: "Failed to upload file",
              error: error.message,
            });
          }
        }
      );
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
);

app.post("/api/upload/events", upload.array("ps-img", 10), async (req, res) => {
  try {
    const files = req.files;

    const uploadPromises = files.map(async (file) => {
      const blobName = generateBlobName(file.originalname);
      const stream = fs.createReadStream(file.path);
      const streamLength = file.size;

      const options = {
        contentSettings: {
          contentType: file.mimetype,
        },
      };

      return new Promise((resolve, reject) => {
        blobService.createBlockBlobFromStream(
          EventsImage,
          blobName,
          stream,
          streamLength,
          options,
          (error, result, response) => {
            // Cleanup the temporary file after uploading
            fs.unlink(file.path, (unlinkError) => {
              if (unlinkError) {
                console.error("Error deleting temporary file:", unlinkError);
              }
            });

            if (!error) {
              const startDate = new Date();
              const expiryDate = new Date(startDate);
              expiryDate.setMinutes(startDate.getMinutes() + 30);

              const sharedAccessPolicy = {
                AccessPolicy: {
                  Permissions: azure.BlobUtilities.SharedAccessPermissions.READ,
                  Start: startDate,
                  Expiry: expiryDate,
                },
              };

              const sasToken = blobService.generateSharedAccessSignature(
                EventsImage,
                blobName,
                sharedAccessPolicy
              );

              const imageUrl = blobService.getUrl(
                EventsImage,
                blobName
                // sasToken // will expire
              );

              // Resolve with the modified response format
              resolve({
                success: true,
                message: "File uploaded successfully",
                data: [
                  {
                    filename: file.originalname,
                    imageUrl,
                  },
                ],
              });
            } else {
              reject({
                success: false,
                message: "Failed to upload file",
                error: error.message,
                filename: file.originalname,
              });
            }
          }
        );
      });
    });

    const results = await Promise.all(uploadPromises);

    // Cleanup other files in the 'uploads' folder
    cleanupTemporaryFiles();

    // Combine the individual results into a single response
    const finalResponse = {
      success: true,
      message: "All files uploaded successfully",
      data: results.flatMap((result) => result.data),
    };

    res.status(200).json(finalResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

function generateBlobName(originalName) {
  const timestamp = new Date().getTime();
  return `${timestamp}_${originalName}`;
}

function cleanupTemporaryFiles() {
  const uploadFolder = "uploads";

  fs.readdir(uploadFolder, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    files.forEach((file) => {
      const filePath = `${uploadFolder}/${file}`;
      fs.unlink(filePath, (unlinkError) => {
        if (unlinkError) {
          console.error("Error deleting temporary file:", unlinkError);
        }
      });
    });
  });
}
app.listen(PORT, () => {
  Connection();
  console.log(`connection is on :: >> ${PORT}`);
});

// cron job

// */2 * * * * // each two minutes
// 0 0 * * * // 12 am of each day

// cron job for FD
cron.schedule("*/2 * * * *", async () => {
  return false;
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

// cron job for all events type
cron.schedule("*/2 * * * *", async () => {
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

const isEventAlive = async (event) => {
  const currentDate = moment();
  const eventEndDate = moment(event.end_at, "MM/DD/YYYY"); // Adjust the date format

  // console.log("Current Date:", currentDate.format("DD/MM/YYYY"));
  // console.log("Event End Date:", eventEndDate.format("DD/MM/YYYY"));

  // console.log("Comparison Result:", currentDate.isSameOrBefore(eventEndDate, 'day'));

  if (currentDate.isSameOrBefore(eventEndDate, "day")) {
    // console.log("Setting status to 2");
    // If current date is same as or before end_at date, update event status to 2 (inactive)
    await eventSchema.findByIdAndUpdate(event._id, { status: 2 });
    return { alive: false, status: 2 }; // Event is not alive
  }

  return { alive: true, status: event.status };
};

async function processDailyEvent(event) {
  const isAliveData = await isEventAlive(event);
  if (isAliveData.alive === false) {
    return;
  }
  // Access the event status using isAliveData.status if needed

  const startDate = moment(event.start_at, "DD/MM/YYYY").add(1, "day"); // Start one day ahead of the current date
  const endDate = startDate.clone().add(2, "days"); // endDate is three days ahead of startDate

  const latestActivities = await activitySchema
    .find({
      eventId: event._id,
      userId: event.userId,
      kidId: event.kidId,
    })
    .sort({ end_at: -1 })
    .limit(1);

  // Function to create activity data
  const createActivityData = (startDate) => ({
    _id: event._id,
    userId: event.userId,
    kidId: event.kidId,
    activity_name: event.name,
    status: event.status,
    remarks: undefined,
    start_at: startDate.format("DD/MM/YYYY"),
    end_at: startDate.format("DD/MM/YYYY"), // Set end_at to the same day
    photo: "https://photos.google.com",
  });

  if (latestActivities.length === 0) {
    // No latest activity, create activities for the specified range
    while (startDate.isSameOrBefore(endDate)) {
      // Check if you need to create an activity entry based on other conditions
      for (let index = 0; index < event.max_count; index++) {
        const activityData = createActivityData(startDate);
        await addActivityCronJob(activityData);
      }
      startDate.add(1, "day");
    }
  } else {
    // There is a latest activity
    const currentDate = moment();
    const latestActivityStartDate = moment(
      latestActivities[0].end_at,
      "DD/MM/YYYY"
    );

    // Start one day ahead of the latest activity start date
    const startDate = latestActivityStartDate.clone().add(1, "day");
    const endDate = startDate.clone().add(2, "days"); // endDate is three days ahead of startDate
    //   console.log(currentDate.isAfter(latestActivityStartDate))
    // process.exit();

    if (currentDate.isAfter(latestActivityStartDate)) {
      // Current date is greater than latestActivity start_at date, create a new activity
      while (startDate.isSameOrBefore(endDate)) {
        // Check if you need to create an activity entry based on other conditions
        for (let index = 0; index < event.max_count; index++) {
          const activityData = createActivityData(startDate);
          await addActivityCronJob(activityData);
        }
        startDate.add(1, "day");
      }
    }
  }
}

async function processWeeklyEvent(event) {
  const isAliveData = await isEventAlive(event);
  if (!isAliveData.alive) {
    return;
  }
  const latestActivities = await activitySchema
    .find({
      eventId: event._id,
      userId: event.userId,
      kidId: event.kidId,
    })
    .sort({ end_at: -1 })
    .limit(1);
  // console.log(latestActivities)
  //   process.exit();

  const currentDate = moment();
  const latestActivityStartDate = moment(
    latestActivities[0].end_at,
    "DD/MM/YYYY"
  );
  if (latestActivities.length !== 0) {
    if (currentDate.isAfter(latestActivityStartDate)) {
      // Check if you need to create an activity entry based on other conditions

      // const startDate = moment(event.start_at, "DD/MM/YYYY");
      const startDate = currentDate;
      // console.log(startDate);
      // Set endDate to the end of the week and get the next Sunday
      const endDate = startDate.clone().endOf("isoWeek").isoWeekday(7);
      // console.log(endDate);

      let entryCount = 0;

      while (entryCount < event.max_count) {
        // Check if you need to create an activity entry based on other conditions
        const activityData = {
          _id: event._id,
          userId: event.userId,
          kidId: event.kidId,
          activity_name: event.name,
          status: event.status,
          remarks: undefined,
          start_at: startDate.format("DD/MM/YYYY"),
          end_at: endDate.clone().format("DD/MM/YYYY"), // Set end_at to the calculated next Sunday
          photo: "https://photos.google.com",
        };

        await addActivityCronJob(activityData);
        entryCount++;
      }
      startDate.add(1, "day");
    }
  }
}
// changes...
async function processMonthlyEvent(event) {
  const isAliveData = await isEventAlive(event);
  if (!isAliveData.alive) {
    return;
  }
  const latestActivities = await activitySchema
    .find({
      eventId: event._id,
      userId: event.userId,
      kidId: event.kidId,
    })
    .sort({ end_at: -1 })
    .limit(1);

  const currentDate = moment();
  const latestActivityEndDate = moment(
    latestActivities[0]?.end_at,
    "DD/MM/YYYY"
  );

  // console.log(latestActivityEndDate);
  // console.log(currentDate.isAfter(latestActivityEndDate))

  // process.exit();

  if (
    latestActivities.length !== 0 &&
    currentDate.isAfter(latestActivityEndDate)
  ) {
    const startDate = currentDate.clone();
    // console.log("startDate:", startDate.format("DD/MM/YYYY"));

    // Set endDate to the last day of the current month
    const endDate = startDate.clone().endOf("month");
    // console.log("endDate:", endDate.format("DD/MM/YYYY"));

    let entryCount = 0;

    // console.log(startDate.isSameOrBefore(endDate));
    // process.exit();

    while (startDate.isSameOrBefore(endDate) && entryCount < event.max_count) {
      // Check if you need to create an activity entry based on other conditions
      const activityData = {
        _id: event._id,
        userId: event.userId,
        kidId: event.kidId,
        activity_name: event.name,
        status: event.status,
        remarks: undefined,
        start_at: startDate.format("DD/MM/YYYY"),
        end_at: endDate.format("DD/MM/YYYY"),
        photo: "https://photos.google.com",
      };

      await addActivityCronJob(activityData);
      entryCount++;

      // Move to the next day
      startDate.add(1, "day");
    }
  }
}

// crone job for event's activities
cron.schedule("*/5 * * * *", async () => {
  return false;
  try {
    const currentDate = moment();

    // Find activities where end_at is on or before the current date and status is 1
    const activitiesToUpdate = await activitySchema.find({
      end_at: { $lte: currentDate.format("DD/MM/YYYY") },
      status: 1,
    });

    // Update the status of matching activities to 2 (inactive)
    const updatePromises = [];

    for (const activity of activitiesToUpdate) {
      const singleActivityUpdated = await activitySchema.findOneAndUpdate(
        { _id: activity._id },
        { status: 2 },
        { new: true } // This option returns the modified document
      );

      if (singleActivityUpdated) {
        const eventDetails = await getEventDetails(
          singleActivityUpdated.eventId
        );

        if (eventDetails) {
          const isTotalDone = await updateOrCreateKidBalance(
            eventDetails.userId,
            eventDetails.kidId,
            eventDetails.stars,
            is_credit
          );

          if (isTotalDone) {
            addPassbook(
              {
                userId: eventDetails.userId,
                entryId: eventDetails._id,
                status: `ACTIVITY OF ${eventDetails.name}`,
                balance_stars: eventDetails.stars,
                available_balance: isTotalDone.available_balance,
              },
              (passbookResponse) => {
                // console.log(passbookResponse);
              }
            );
          }
        }
      }
    }

    response.status(200).json({
      success: true,
      message: "Activity statuses updated successfully",
    });
  } catch (error) {
    console.log(error);
    response.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ... (rest of your code)
