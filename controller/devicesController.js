import deviceSchema from "../model/deviceSchema.js";
import { code400 } from "../responseCode.js";

export const addDevice = async (request, response) => {
  // console.log(request.body);
  // process.exit();
  try {
    const deviceData = {
      user_id: request.body.user_id,
      device_id: request.body.device_id,
      device_name: request.body.device_name,
      login_at: request.body.login_at,
      device_ip: request.body.device_ip,
    };

    const savedDevice = await deviceSchema.create(deviceData);

    response.status(200).json({
      success: true,
      message: "Device stored successfully",
      id: savedDevice.id,
    });
  } catch (error) {
    response.status(400).json({ errorCode : code400, success: false, error: error.message });
  }
};

export const updateDevice = async (request, response) => {
  try {
    const deviceId = request.params.id;

    const updatedDeviceData = {
      user_id: request.body.user_id,
      device_id: request.body.device_id,
      device_name: request.body.device_name,
      login_at: request.body.login_at,
      device_ip: request.body.device_ip,
    };

    const updatedDevice = await deviceSchema.findOneAndUpdate(
      { _id: deviceId },
      updatedDeviceData,
      { new: true }
    );

    if (!updatedDevice) {
      return response.status(404).json({
        errorCode : code400,
        success: false,
        message: "Device not found",
      });
    }

    response.status(200).json({
      success: true,
      message: "Device updated successfully",
      updatedDevice,
    });
  } catch (error) {
    response.status(400).json({ errorCode : code400, success: false, error: error.message });
  }
};

export const deleteDevice = async (request, response) => {
  try {
    const deviceId = request.params.id;

    const deletedDevice = await deviceSchema.findByIdAndDelete(deviceId);

    if (!deletedDevice) {
      return response.status(404).json({
        errorCode : code400,
        success: false,
        message: "Device not found",
      });
    }

    response.status(200).json({
      success: true,
      message: "Device deleted successfully",
    });
  } catch (error) {
    response.status(400).json({ errorCode : code400, success: false, error: error.message });
  }
};
