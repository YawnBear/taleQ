import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      console.log('Missing fields:', { file });
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Prepare FormData for Jamaibase file upload
    const fd = new FormData();
    fd.append('file', file, file.name);

    console.log('Starting upload for:', file.name);

    // Step 1: Upload file to Jamaibase
    let uploadRes, uploadText, uploadData;
    try {
      uploadRes = await fetch('https://api.jamaibase.com/api/v1/files/upload', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${process.env.JAMAI_API_KEY}`,
          'X-PROJECT-ID': process.env.JAMAI_PROJECT_ID,
        },
        body: fd,
      });

      console.log('Upload response status:', uploadRes.status);
      
      uploadText = await uploadRes.text();
      console.log('Upload response length:', uploadText.length);
      
      if (!uploadRes.ok) {
        throw new Error(`Upload failed: ${uploadRes.status} - ${uploadText}`);
      }

      uploadData = JSON.parse(uploadText);
      console.log('✅ Upload successful');
    } catch (uploadError) {
      console.error('❌ Upload step failed:', uploadError.message);
      throw new Error(`File upload failed: ${uploadError.message}`);
    }

    const fileUrl = uploadData?.data?.url || uploadData?.url || uploadData?.uri;

    if (!fileUrl) {
      console.error('❌ No fileUrl extracted from:', uploadData);
      throw new Error('No file URL returned from upload');
    }

    console.log('File URL extracted:', fileUrl);

    // Step 2: Add row to Jamaibase table
    let rowRes, rowText, rowData;
    try {
      rowRes = await fetch('https://api.jamaibase.com/api/v1/gen_tables/action/rows/add', {
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

      console.log('Row add response status:', rowRes.status);
      
      rowText = await rowRes.text();
      console.log('Row add response length:', rowText.length);
      
      if (!rowRes.ok) {
        throw new Error(`Row add failed: ${rowRes.status} - ${rowText}`);
      }

      // Handle different response formats more safely
      if (rowText.trim()) {
        try {
          rowData = JSON.parse(rowText);
        } catch (parseError) {
          console.warn('⚠️ Row response not JSON, treating as raw:', rowText.substring(0, 100));
          rowData = { raw: rowText, success: true };
        }
      } else {
        console.warn('⚠️ Empty row response, assuming success');
        rowData = { success: true };
      }
      
      console.log('✅ Row add successful');
    } catch (rowError) {
      console.error('❌ Row add step failed:', rowError.message);
      throw new Error(`Row addition failed: ${rowError.message}`);
    }

    console.log('✅ Complete success for:', file.name);
    return NextResponse.json({ 
      message: 'Resume uploaded successfully!', 
      data: rowData,
      fileUrl: fileUrl
    });

  } catch (error) {
    console.error('❌ Overall error for file:', error.message);
    console.error('❌ Stack trace:', error.stack);
    
    // Return more specific error information
    return NextResponse.json({ 
      message: 'Upload failed', 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}