import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();

    const { jobPosition, jobDesc, skillSet, remarks } = body;

    // Simulate storing in a database or logging
    console.log('New Job Submission:', {
      jobPosition,
      jobDesc,
      skillSet,
      remarks,
    });

    return NextResponse.json({ message: 'Job data received successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ message: 'Failed to process job data' }, { status: 500 });
  }
}
