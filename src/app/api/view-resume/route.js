import { NextResponse } from 'next/server';

// GET - Fetch and resolve resume (CV) file
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('id');
    const action = searchParams.get('action');

    if (!resumeId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Resume ID is required' 
      }, { status: 400 });
    }

    if (action === 'details') {
      // Fetch resume details from the database
      const detailsResponse = await fetch(
        `https://api.jamaibase.com/api/v1/gen_tables/action/${process.env.JAMAI_ACTION_TABLE_ID}/rows/${resumeId}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            authorization: `Bearer ${process.env.JAMAI_API_KEY}`,
            "X-PROJECT-ID": process.env.JAMAI_PROJECT_ID,
          },
        }
      );

      if (!detailsResponse.ok) {
        throw new Error(`Failed to fetch resume details: ${detailsResponse.statusText}`);
      }

      const details = await detailsResponse.json();

      return NextResponse.json({ 
        success: true, 
        details: details 
      });
    } 
else if (action === 'view') {
  // Step 1: Get the URI of the file (cv column)
  const metadataResponse = await fetch(
    `https://api.jamaibase.com/api/v1/gen_tables/action/${process.env.JAMAI_ACTION_TABLE_ID}/rows/${resumeId}?columns=cv`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${process.env.JAMAI_API_KEY}`,
        "X-PROJECT-ID": process.env.JAMAI_PROJECT_ID,
      },
    }
  );

  if (!metadataResponse.ok) {
    throw new Error(`Failed to fetch file metadata: ${metadataResponse.statusText}`);
  }

  const metadata = await metadataResponse.json();
  const uri = metadata?.cv;

  if (!uri) {
    return NextResponse.json(
      { success: false, error: 'No CV URI found for this resume ID' },
      { status: 404 }
    );
  }

  // Step 2: Resolve the file using the URL Raw endpoint
  const rawFileResponse = await fetch(
    'https://api.jamaibase.com/api/v1/files/url/raw',
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${process.env.JAMAI_API_KEY}`,
        'X-PROJECT-ID': process.env.JAMAI_PROJECT_ID,
      },
      body: JSON.stringify({ uris: [uri.value] }),
    }
  );

  if (!rawFileResponse.ok) {
    throw new Error(`Failed to resolve file from URI: ${rawFileResponse.statusText}`);
  }

  const fileData = await rawFileResponse.json();
  const fileUrl = fileData.urls;

  if (!fileUrl) {
    console.error('Resolved file URL is missing');
    return NextResponse.json(
      { success: false, error: 'Resolved file URL is missing' },
      { status: 500 }
    );
  }

  // Step 3: Fetch the actual file blob from the resolved URL
  const actualFile = await fetch(fileUrl);
  const fileBlob = await actualFile.blob();

  return new NextResponse(fileBlob, {
    headers: {
      'Content-Type': fileBlob.type || 'application/octet-stream',
      'Content-Disposition': 'inline',
    },
  });
}
    else {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid action specified' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in view-resume API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}