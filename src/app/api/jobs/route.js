import { NextResponse } from 'next/server';

// GET - Fetch jobs or job details
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('id');
    const action = searchParams.get('action');

    // If fetching details for a specific job
    if (jobId && action === 'details') {
      const response = await fetch(
        `https://api.jamaibase.com/api/v1/gen_tables/knowledge/${process.env.JAMAI_KNOWLEDGE_TABLE_ID}/rows/${jobId}?columns=jobPosition&columns=jobDescription&columns=skillSet&columns=remarks`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            authorization: `Bearer ${process.env.JAMAI_API_KEY}`,
            "X-PROJECT-ID": process.env.JAMAI_PROJECT_ID,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch job details: ${response.statusText}`);
      }

      const data = await response.json();
      return NextResponse.json({ success: true, details: data });
    }

    // Default: Fetch all jobs
    const response = await fetch(
      `https://api.jamaibase.com/api/v1/gen_tables/knowledge/${process.env.JAMAI_KNOWLEDGE_TABLE_ID}/rows?columns=ID&columns=jobPosition`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          authorization: `Bearer ${process.env.JAMAI_API_KEY}`,
          "X-PROJECT-ID": process.env.JAMAI_PROJECT_ID,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, jobs: data.items || [] });
  } catch (error) {
    console.error('Error in GET /api/jobs:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

// POST - Upload job files or create jobs
export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type');
    
    // Handle file upload (FormData)
    if (contentType && contentType.includes('multipart/form-data')) {
      const pdfData = await request.formData();
      const file = pdfData.get("file");

      if (!file) {
        return NextResponse.json({ message: 'Missing file' }, { status: 400 });
      }

      const formData = new FormData();
      formData.append('file', file, 'job description file.pdf'); 
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
    }
    
    // Handle JSON data (manual job creation)
    else {
      const body = await request.json();
      
      // Add your job creation logic here if needed
      return NextResponse.json({ 
        success: true, 
        message: 'Job creation endpoint ready',
        data: body
      });
    }
  } catch (error) {
    console.error('POST /api/jobs error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message }, 
      { status: 500 }
    );
  }
}

// DELETE - Delete a job by ID
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('id');

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const options = {
      method: 'DELETE',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${process.env.JAMAI_API_KEY}`,
        'X-PROJECT-ID': process.env.JAMAI_PROJECT_ID
      }
    };

    const response = await fetch(
      `https://api.jamaibase.com/api/v1/gen_tables/knowledge/${process.env.JAMAI_KNOWLEDGE_TABLE_ID}/rows/${jobId}`, 
      options
    );

    if (response.ok) {
      return NextResponse.json({ 
        success: true, 
        message: 'Job deleted successfully' 
      });
    } else {
      const errorText = await response.text();
      console.error('JamAI API error:', errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to delete job' }, 
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Delete job error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}