import tagSchema from "../model/tagSchema.js";
import { code200, code400 } from "../responseCode.js";

export const addTag = async (request, response) => {
  try {
    const userId = request.params.userId || request.body.userId;

    if (!userId) {
      return response.status(400).json({
        errorCode: code400,
        success: false,
        error: "UserId is required.",
      });
    }

    const tagData = {
      userId: userId,
      name: request.body.name,
      tag_type: request.body.tag_type,
      photo: request.body.photo,
    };

    const savedTag = await tagSchema.create(tagData);

    response.status(200).json({
      success: true,
      message: "Tag created successfully",
      id: savedTag.id,
    });
  } catch (error) {
    let errorMessage = "Error creating tag.";

    if (error.errors) {
      const errorKeys = Object.keys(error.errors);

      // Check for specific field validation errors
      if (errorKeys.length > 0) {
        errorMessage = error.errors[errorKeys[0]].message;
      }
    }

    response.status(400).json({
      errorCode: code400,
      success: false,
      error: errorMessage,
    });
  }
};



export const updateTag = async (request, response) => {
  try {
    const tagId = request.params.id;

    const updatedTagData = {
      name: request.body.name,
      tag_type: request.body.tag_type,
      photo: request.body.photo,
    };

    const updatedTag = await tagSchema.findOneAndUpdate(
      { _id: tagId },
      updatedTagData,
      { new: true }
    );

    if (!updatedTag) {
      return response.status(404).json({
        success: false,
        message: "Tag not found",
      });
    }

    response.status(200).json({
      success: true,
      message: "Tag updated successfully",
      updatedTag,
    });
  } catch (error) {
    response
      .status(400)
      .json({ errorCode: code400, success: false, error: error.message });
  }
};

export const deleteTag = async (request, response) => {
  try {
    const tagId = request.params.id;

    const deletedTag = await tagSchema.findByIdAndDelete(tagId);

    if (!deletedTag) {
      return response.status(404).json({
        success: false,
        message: "Tag not found",
      });
    }

    response.status(200).json({
      success: true,
      message: "Tag deleted successfully",
    });
  } catch (error) {
    response
      .status(400)
      .json({ errorCode: code400, success: false, error: error.message });
  }
};

export const getSingleTag = async (request, response) => {
  try {
    const _id = request.body._id;
    const tag_type = request.body.tag_type;

    // Find the tag details using both _id and tag_type
    // const tagDetails = await tagSchema.findOne({ _id, tag_type });
    const tagDetails = await tagSchema.findOne({ _id, tag_type });

    if (!tagDetails) {
      return response.status(404).json({
        errorCode: code400,
        success: false,
        error: "Tag not found",
      });
    }

    response.status(200).json({
      code: code200,
      success: true,
      message: "Successful",
      tag: tagDetails,
    });
  } catch (error) {
    response.status(500).json({
      errorCode: code400,
      success: false,
      error: error.message,
    });
  }
};

export const getAlltags = async (request, response) => {
  try {
    const userId = request.body.userId; // Assuming userId is part of the route parameters

    // Check if userId is provided
    if (!userId) {
      return response.status(400).json({
        errorCode: code400,
        success: false,
        error: "UserId is required.",
      });
    }

    // Fetch tags that match the provided userId
    const details = await tagSchema.find({ userId });

    const totalRecords = details.length;

    response.status(200).json({
      code: code200,
      success: true,
      message: "Successful",
      totalRecords: totalRecords,
      data: details,
    });
  } catch (err) {
    response.status(404).json({
      errorCode: code400,
      success: false,
      error: "Not found",
    });
  }
};

