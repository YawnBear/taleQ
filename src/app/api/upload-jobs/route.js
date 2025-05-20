import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const pdfData = await request.formData();
    const file = pdfData.get("file");

    if (!file) {
      return NextResponse.json({ message: 'Missing file' }, { status: 400 });
    }

    const formData = new FormData();
    formData.append('file', file,'job description file.pdf'); 
    formData.append('table_id', process.env.JAMAI_KNOWLEDGE_TABLE_ID);

    const response = await fetch('https://api.jamaibase.com/api/v1/gen_tables/knowledge/embed_file', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${process.env.JAMAI_API_KEY}`,
        'X-PROJECT-ID': process.env.JAMAI_PROJECT_ID,
      },
      body: formData,
    });

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = { raw: text };
    }

    if (!response.ok) {
      return NextResponse.json({ message: 'Upload failed', result }, { status: response.status });
    }

    return NextResponse.json({ message: 'Upload successful', result });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
