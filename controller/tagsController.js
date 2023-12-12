import tagSchema from "../model/tagSchema.js";
import { code400 } from "../responseCode.js";

export const addTag = async (request, response) => {
  // console.log(request.body);
  // process.exit();
  try {
    const tagData = {
      name: request.body.name,
      photo: request.body.photo,
    };

    const savedTag = await tagSchema.create(tagData);

    response.status(201).json({
      success: true,
      message: "tag created successfully",
      id: savedTag.id,
    });
  } catch (error) {
    response.status(400).json({ errorCode : code400, success: false, error: error.message });
  }
};

export const updateTag = async (request, response) => {
  try {
    const tagId = request.params.id;

    const updatedTagData = {
      name: request.body.name,
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
    response.status(400).json({ errorCode : code400, success: false, error: error.message });
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
    response.status(400).json({ errorCode : code400, success: false, error: error.message });
  }
};
