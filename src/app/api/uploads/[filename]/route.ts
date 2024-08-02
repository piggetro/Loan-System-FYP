import { type NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const IMAGE_DIRECTORY = process.env.IMAGE_DIRECTORY ?? "";

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } },
) {
  const filename = params.filename;

  if (!filename) {
    return new NextResponse(
      JSON.stringify({ error: "Filename not provided" }),
      { status: 400 },
    );
  }

  const imagePath = path.join(IMAGE_DIRECTORY, filename);
  const defaultImagePath = path.join(IMAGE_DIRECTORY, "default.jpg");

  try {
    // Check if the requested file exists
    await fs.access(imagePath);

    // Read the file from the file system
    const imageBuffer = await fs.readFile(imagePath);

    // Determine the content type based on the file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";

    switch (ext) {
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
      // Add more cases as needed
    }

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    try {
      // Fallback to default.jpg if requested file does not exist
      const defaultImageBuffer = await fs.readFile(defaultImagePath);

      return new NextResponse(defaultImageBuffer, {
        headers: {
          "Content-Type": "image/jpeg", // Default to JPEG for fallback
        },
      });
    } catch (fallbackError) {
      return new NextResponse(JSON.stringify({ error: "File not found" }), {
        status: 404,
      });
    }
  }
}
