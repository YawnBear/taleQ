import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { rowId, newStatus } = await request.json();

        if (!rowId || !newStatus) {
            return NextResponse.json({
                error: "Missing required fields",
                message: "Both rowId and newStatus are required"
            }, { status: 400 });
        }

        console.log(`Updating resume ${rowId} status to ${newStatus}`);

        const response = await fetch('https://api.jamaibase.com/api/v1/gen_tables/action/rows/update', {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authorization: `Bearer ${process.env.JAMAI_API_KEY}`,
                'X-PROJECT-ID': process.env.JAMAI_PROJECT_ID
            },
            body: JSON.stringify({
                data: { shortlisted: newStatus },
                table_id: process.env.JAMAI_ACTION_TABLE_ID,
                row_id: rowId
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('JamAI API error:', errorData);
            throw new Error(`JamAI API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Status update successful:', result);

        return NextResponse.json({
            success: true,
            message: "Status updated successfully",
            data: result
        });

    } catch (error) {
        console.error("Status update error:", error);
        return NextResponse.json({
            error: "Internal server error",
            message: error.message
        }, { status: 500 });
    }
}