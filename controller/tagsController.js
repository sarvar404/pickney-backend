import tagSchema from "../model/tagSchema.js";
import { code200, code400 } from "../responseCode.js";

export const addTag = async (request, response) => {
  try {
    const tagData = {
      name: request.body.name,
      tag_type: request.body.tag_type,
      photo: request.body.photo,
    };

    const savedTag = await tagSchema.create(tagData);

    response.status(200).json({
      success: true,
      message: "tag created successfully",
      id: savedTag.id,
    });
  } catch (error) {
    response
      .status(400)
      .json({ errorCode: code400, success: false, error: error.message });
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
    const details = await tagSchema.find();
    const totalRecords = details.length;
    response.status(200).json({
      code: code200,
      success: true,
      message: "Successful",
      totalRecords: totalRecords,
      data: details,
    });
  } catch (err) {
    response
      .status(404)
      .json({ errorCode: code400, success: false, error: "Not found" });
  }
};
