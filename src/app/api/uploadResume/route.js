// import { NextResponse } from 'next/server';
// import { writeFile } from 'fs/promises';
// import path from 'path';
// import { mkdir } from 'fs/promises';
// import FormData from 'form-data';
// import fetch from 'node-fetch';  

// export async function POST(req) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get("file");

//     if (!file) {
//       return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
//     }

//     const buffer = Buffer.from(await file.arrayBuffer());

//     // Forward the file to the external API
//     const JamAIFormData = new FormData();
//     JamAIFormData.append("file", buffer, {
//         filename: file.name,
//         contentType: file.type, 
//     });
//     JamAIFormData.append('file_name', file.name)
//     JamAIFormData.append('table_id', 'test1')


//     const response = await fetch('https://api.jamaibase.com/api/v1/gen_tables/knowledge/upload_file', {
//         method: 'POST',
//         body: JamAIFormData,
//         headers: {
//             ...JamAIFormData.getHeaders(),
//             accept: 'application/json',
//             Authorization: `Bearer ${process.env.JAMAI_API_KEY}`,
//             "X-PROJECT-ID": process.env.JAMAI_PROJECT_ID,
//         },
//     });


//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("JamAI API error:", errorText);
//       return NextResponse.json({ message: "Failed to connect to JamAI" }, { status: response.status });
//     }

//     const result = await response.json();

//     return NextResponse.json({
//       message: "File uploaded and forwarded successfully!",
//       externalResponse: result,
//     });
//   } catch (error) {
//     console.error("Upload or forward failed:", error);
//     return NextResponse.json({ message: "Upload failed", error: error.message }, { status: 500 });
//   }
// }


import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const name = formData.get('name');
    const description = formData.get('description');

    if (!file || !name || !description) {
      console.log('Missing fields:', { file, name, description });
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Prepare FormData for Jamaibase file upload
    const fd = new FormData();
    fd.append('file', file, file.name);

    // Step 1: Upload file to Jamaibase
    const uploadRes = await fetch('https://api.jamaibase.com/api/v1/files/upload/', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${process.env.JAMAI_API_KEY}`,
        'X-PROJECT-ID': process.env.JAMAI_PROJECT_ID,
      },
      body: fd,
    });

    const uploadText = await uploadRes.text();
    let uploadData;
    try {
      uploadData = JSON.parse(uploadText);
    } catch (e) {
      console.error('Failed to parse upload response:', uploadText);
      throw e;
    }
    console.log('Upload response:', uploadData);

    const fileUrl = uploadData?.data?.url || uploadData?.url || uploadData?.uri;

    if (!fileUrl) {
      return NextResponse.json({ message: 'File upload failed', uploadData }, { status: 500 });
    }

    // Step 2: Add row to Jamaibase table with uploaded file URL
    const rowRes = await fetch('https://api.jamaibase.com/api/v1/gen_tables/action/rows/add', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${process.env.JAMAI_API_KEY}`,
        'X-PROJECT-ID': process.env.JAMAI_PROJECT_ID,
      },
      body: JSON.stringify({
        table_id: process.env.JAMAI_ACTION_TABLE_ID,
        data: [
          {
            cv: fileUrl,
          },
        ],
      }),
    });

    const rowText = await rowRes.text();
    let rowData;
    try {
      if (rowText.trim().startsWith('{') || rowText.trim().startsWith('[')) {
        rowData = JSON.parse(rowText);
      } else {
        rowData = { raw: rowText };
      }
    } catch (e) {
      console.error('Failed to parse row response:', rowText);
      throw e;
    }
    console.log('Row add response:', rowData);

    return NextResponse.json({ message: 'Resume uploaded and row added!', data: rowData });
  } catch (error) {
    console.error('Server error:', error, error.stack);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}