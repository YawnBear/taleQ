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
      // Step 1: Get the file URI from the database
      const metadataResponse = await fetch(
        `https://api.jamaibase.com/api/v1/gen_tables/action/${process.env.JAMAI_ACTION_TABLE_ID}/rows/${resumeId}?columns=${process.env.JAMAI_ACTION_COLUMN_ID}`,
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
      console.log('Metadata response:', metadata);
      
      // Try different ways to extract the URI
      const uri = metadata?.cv?.value || metadata?.cv || metadata?.[process.env.JAMAI_ACTION_COLUMN_ID]?.value || metadata?.[process.env.JAMAI_ACTION_COLUMN_ID];
      
      console.log('Extracted URI:', uri);

      if (!uri) {
        return NextResponse.json(
          { success: false, error: 'No CV URI found for this resume ID', metadata },
          { status: 404 }
        );
      }

      // Step 2: Resolve the file URL from the URI
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
          body: JSON.stringify({ uris: [uri] }),
        }
      );

      if (!rawFileResponse.ok) {
        const errorText = await rawFileResponse.text();
        throw new Error(`Failed to resolve file from URI: ${rawFileResponse.statusText} - ${errorText}`);
      }

      const fileData = await rawFileResponse.json();
      console.log('File resolution response:', fileData);
      
      // Extract the URL from the response
      const fileUrl = fileData?.urls?.[0] || fileData?.url || fileData?.urls;
      
      console.log('Resolved file URL:', fileUrl);

      if (!fileUrl) {
        return NextResponse.json(
          { success: false, error: 'Failed to resolve file URL', fileData },
          { status: 500 }
        );
      }

      // Step 3: Fetch the actual file content
      const fileResponse = await fetch(fileUrl);
      
      if (!fileResponse.ok) {
        throw new Error(`Failed to fetch file content: ${fileResponse.statusText}`);
      }

      const fileBuffer = await fileResponse.arrayBuffer();
      
      // Determine content type based on file extension or default to PDF
      const contentType = uri.toLowerCase().includes('.pdf') ? 'application/pdf' : 'application/octet-stream';
      
      // Return the file directly with proper headers for inline viewing
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': 'inline; filename="resume.pdf"',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
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