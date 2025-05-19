import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    let body;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    } else {
      return NextResponse.json({ message: 'Unsupported content type' }, { status: 415 });
    }

    const { jobPosition, jobDesc, skillSet, remarks } = body;

    if (!jobPosition || !jobDesc || !skillSet || !remarks) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const rowRes = await fetch('https://api.jamaibase.com/api/v1/gen_tables/knowledge/rows/add', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${process.env.JAMAI_API_KEY}`,
        'X-PROJECT-ID': process.env.JAMAI_PROJECT_ID,
      },
      body: JSON.stringify({
        table_id: process.env.JAMAI_KNOWLEDGE_TABLE_ID,
        table_type: 'knowledge',
        data: [
          {
            jobPosition,
            jobDesc,
            skillSet,
            remarks,
          },
        ],
      }),
    });

    const rowText = await rowRes.text();
    let rowData;
    try {
      rowData = JSON.parse(rowText);
    } catch (e) {
      console.error('Failed to parse row add response:', rowText);
      rowData = { raw: rowText };
    }

    return NextResponse.json({ message: 'Job data added successfully!', data: rowData });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
