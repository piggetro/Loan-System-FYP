import { writeFile, unlink } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

const IMAGE_DIRECTORY = process.env.IMAGE_DIRECTORY ?? "";

// Utility function to delete a file
async function deleteFile(filePath: string) {
  try {
    await unlink(filePath);
  } catch (error) {
    console.error(`Failed to delete file at ${filePath}:`, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get("file") as File;
    const oldPath = data.get("oldPath") as string;
    const newPath = data.get("newPath") as string;

    // Check if file exists and is not default.jpg
    if (oldPath && oldPath !== "default.jpg") {
      const oldFilePath = path.join(IMAGE_DIRECTORY, oldPath);
      await deleteFile(oldFilePath);
    }

    // Handle file upload if file and newPath are provided
    if (file && newPath && newPath !== "default.jpg") {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const newFilePath = path.join(IMAGE_DIRECTORY, newPath);
      await writeFile(newFilePath, buffer);

      return NextResponse.json({ success: true, filePath: newPath });
    }

    // No file provided or using default.jpg
    return NextResponse.json({
      success: false,
      message: "No valid file provided or using default image.",
    });
  } catch (error) {
    console.error("Error handling the request:", error);
    return NextResponse.json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
