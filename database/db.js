import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDatabase = async () => {
  const URL = process.env.URL;

  // for  @ = %40
  // for   ' = %27
  // for  ! = %21

  // mongodb://0.0.0.0:27017/test
  // mongodb://pickneyadmin:pickneyadmin@3.12.139.154:27017/pickneydb?directConnection=true&appName=mongosh+2.1.0
  // mongodb+srv://server123:server123@db-sarvar-conexus.n3m7z8m.mongodb.net/?retryWrites=true&w=majority

  // MongoDB connection string with updated options
  const connectionString = `mongodb+srv://server123:server123@db-sarvar-conexus.n3m7z8m.mongodb.net/?retryWrites=true&w=majority`;

  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database Connected Successfully");
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
  }
};

export default connectDatabase;
