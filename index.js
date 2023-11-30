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

// external imports
// import userRouter from "./routes/users.js"
import eventsRouter from "./routes/events.js";
import activitiesRouter from "./routes/activities.js";
import tagsRouter from "./routes/tags.js";
import devicesRouter from "./routes/devices.js";
import usersRouter from "./routes/users.js";

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

app.use('/api', eventsRouter);
app.use('/api', activitiesRouter);
app.use('/api', tagsRouter);
app.use('/api', devicesRouter);
app.use('/api', usersRouter);

app.listen(PORT, () => {
  Connection();
  console.log(`connection is on :: >> ${PORT}`);
});
