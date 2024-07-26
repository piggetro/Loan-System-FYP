import { writeFile, unlink, access, readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const IMAGE_DIRECTORY = process.env.IMAGE_DIRECTORY ?? "";

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get("file") as unknown as File;
  const photoPath = data.get("photoPath") as string;

  if (!photoPath) {
    return NextResponse.json(
      { success: false, message: "No photoPath provided" },
      { status: 400 },
    );
  }

  const fullPath = `${IMAGE_DIRECTORY}/${photoPath}`;

  if (!file) {
    // Do nothing if the file is empty and photoPath is "default.jpg"
    if (photoPath === "default.jpg") {
      return NextResponse.json({
        success: true,
        message: "Default image, no action taken",
      });
    }

    // Otherwise, delete the file
    try {
      await unlink(fullPath);
      return NextResponse.json({ success: true, message: "File deleted" });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "File not found" },
        { status: 404 },
      );
    }
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    // Check if the file already exists
    await access(fullPath);

    // Read the existing file's content
    const existingBuffer = await readFile(fullPath);

    // Compare the hashes of the new and existing files to see if they are the same
    const existingHash = crypto
      .createHash("sha256")
      .update(existingBuffer)
      .digest("hex");
    const newHash = crypto.createHash("sha256").update(buffer).digest("hex");

    if (existingHash === newHash) {
      // If the file is the same, do nothing
      return NextResponse.json({ success: true, message: "File is the same" });
    }
  } catch (error) {
    // If the file does not exist, we proceed to write the new file
    console.log("File does not exist or other error:", error);
  }

  try {
    // Write the new file to the directory
    await writeFile(fullPath, buffer);
    return NextResponse.json({
      success: true,
      message: "File uploaded/overwritten",
    });
  } catch (error) {
    console.error("Error writing file:", error);
    return NextResponse.json(
      { success: false, message: "Error saving file" },
      { status: 500 },
    );
  }
}
