import { NextResponse } from 'next/server';

export async function DELETE(request) {
    try {
        const { resumeId } = await request.json();

        if (!resumeId) {
            return NextResponse.json({
                error: "Missing resume ID",
                message: "Resume ID is required for deletion"
            }, { status: 400 });
        }

        console.log(`Attempting to delete resume with ID: ${resumeId}`);

        const response = await fetch(`https://api.jamaibase.com/api/v1/gen_tables/action/resume/rows/${resumeId}`, {
            method: 'DELETE',
            headers: {
                accept: 'application/json',
                authorization: `Bearer ${process.env.JAMAI_API_KEY}`,
                'X-PROJECT-ID': process.env.JAMAI_PROJECT_ID
            }
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('JamAI API error:', errorData);
            throw new Error(`JamAI API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Resume deletion successful:', result);

        return NextResponse.json({
            success: true,
            message: "Resume deleted successfully",
            data: result
        });

    } catch (error) {
        console.error("Resume deletion error:", error);
        return NextResponse.json({
            error: "Internal server error",
            message: error.message
        }, { status: 500 });
    }
}