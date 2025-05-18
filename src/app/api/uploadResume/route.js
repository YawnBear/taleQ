import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';
import FormData from 'form-data';
import fetch from 'node-fetch';  

export async function POST(req) {
  try {
    const formData = await req.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    // Save the file locally
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });
    const localFilePath = path.join(uploadDir, file.name);
    await writeFile(localFilePath, buffer);

    console.log("Uploaded file saved locally:", localFilePath);

    // Forward the file to the external API
    const JamAIFormData = new FormData();
    JamAIFormData.append("file", buffer, {
        filename: file.name,
        contentType: file.type, 
    });
    JamAIFormData.append('file_name', file.name)
    JamAIFormData.append('table_id', 'test1')


    const response = await fetch('https://api.jamaibase.com/api/v1/gen_tables/knowledge/upload_file', {
        method: 'POST',
        body: JamAIFormData,
        headers: {
            ...JamAIFormData.getHeaders(),
            accept: 'application/json',
            Authorization: `Bearer ${process.env.JAMAI_API_KEY}`,
            "X-PROJECT-ID": process.env.JAMAI_PROJECT_ID,
        },
    });


    if (!response.ok) {
      const errorText = await response.text();
      console.error("JamAI API error:", errorText);
      return NextResponse.json({ message: "Failed to connect to JamAI" }, { status: response.status });
    }

    const result = await response.json();

    return NextResponse.json({
      message: "File uploaded and forwarded successfully!",
      externalResponse: result,
    });
  } catch (error) {
    console.error("Upload or forward failed:", error);
    return NextResponse.json({ message: "Upload failed", error: error.message }, { status: 500 });
  }
}
