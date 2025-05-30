import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Parse the request body
    const requestData = await request.json();

    const response = await fetch(
      `https://api.jamaibase.com/api/v1/gen_tables/knowledge/rows/update`,
      {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.JAMAI_API_KEY}`,
          "X-PROJECT-ID": process.env.JAMAI_PROJECT_ID,
        },
        body: JSON.stringify({
          data:{
            jobPosition: requestData.jobPosition,
            jobDescription: requestData.jobDescription,
            skillSet: requestData.skillSet,
            remarks: requestData.remarks
          },
          table_id: process.env.JAMAI_KNOWLEDGE_TABLE_ID,
          row_id: requestData.id,
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update job details: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, details: data });

  } catch (error) {
    console.error('Error in POST /api/edit-jobs:', error);
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update data' },
      { status: error.name === 'TypeError' ? 503 : 500 }
    );
  }
}