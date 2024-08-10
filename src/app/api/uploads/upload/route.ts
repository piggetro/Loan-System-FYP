import { NextRequest, NextResponse } from "next/server";
import { promises as fsPromises } from "fs";
import { join } from "path";
import { Readable } from "stream";
import unzipper from "unzipper";

const IMAGE_DIRECTORY = process.env.IMAGE_DIRECTORY ?? "";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 },
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const readableZip = new Readable();
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    readableZip._read = () => {};
    readableZip.push(buffer);
    readableZip.push(null);

    const targetDirectory = join(IMAGE_DIRECTORY);

    await fsPromises.mkdir(targetDirectory, { recursive: true });

    await readableZip
      .pipe(unzipper.Extract({ path: targetDirectory }))
      .promise();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500 });
  }
}
