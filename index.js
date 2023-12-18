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
import { addFixedDepositLog, addPassbook } from "./controller/fixedDepositController.js";
import fixedDepositSchema from "./model/fixedDepositSchema.js";
import { fdStatus_MATURED } from "./contentId.js";

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

app.post("/api/upload/common-profile",authSecurityHeader, upload.single("ps-img"), (req, res) => {
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
            blobName,
            sasToken
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
});
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
                blobName,
                sasToken
              );
              resolve({
                success: true,
                message: "File uploaded successfully",
                filename: file.originalname,
                imageUrl,
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

    res.status(200).json(results);
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
cron.schedule("*/2 * * * *", async () => {
  try {
    // console.log("get called");
    // Get all fixed deposits whose maturity date is today or has already passed
    const today = moment().format("MM/DD/YYYY");
    const depositsToMature = await fixedDepositSchema.find({
      $or: [
        { end_at: today },
        { end_at: { $lt: today } }, // Check for past dates
      ],
    });
    // console.log(depositsToMature);

    // Process each deposit to update status and perform additional actions
    depositsToMature.forEach(async (deposit) => {
      // Check if the fixed deposit is cancelled
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
            principal: deposit.principal,
          },
          (passbookResponse) => {
            // console.log(passbookResponse);
          }
        );

        // console.log(`Fixed Deposit ${deposit._id} is cancelled.`);
      } else {
        // Update the status of the fixed deposit
        deposit.status = fdStatus_MATURED;
        await deposit.save();

        // Add the fixed deposit to the logs
        addFixedDepositLog(
          {
            fdId: deposit._id,
            principal: deposit.principal,
            status: fdStatus_MATURED,
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
            status: deposit.status,
            principal: deposit.principal,
          },
          (passbookResponse) => {
            // console.log(passbookResponse);
          }
        );

        // console.log(`Fixed Deposit ${deposit._id} has matured.`);
      }
    });
  } catch (error) {
    console.error("Cron Job Error:", error.message);
  }
});

// ... (rest of your code)
