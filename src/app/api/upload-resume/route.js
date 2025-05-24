import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Prepare FormData for Jamaibase file upload
    const fd = new FormData();
    fd.append('file', file, file.name);

    // Step 1: Upload file to Jamaibase
    const uploadRes = await fetch('https://api.jamaibase.com/api/v1/files/upload', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${process.env.JAMAI_API_KEY}`,
        'X-PROJECT-ID': process.env.JAMAI_PROJECT_ID,
      },
      body: fd,
    });

    const uploadData = await uploadRes.json();
    const fileUrl = uploadData?.data?.url || uploadData?.url || uploadData?.uri;

    if (!fileUrl) {
      return NextResponse.json({ message: 'File upload failed' }, { status: 500 });
    }

    // Step 2: Add row to Jamaibase table
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
            [process.env.JAMAI_ACTION_COLUMN_ID]: fileUrl,
          },
        ],
      }),
    });

    const rowData = await rowRes.json();
    return NextResponse.json({ message: 'Resume uploaded successfully!', data: rowData });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}