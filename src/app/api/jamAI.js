import JamAI from "jamaibase";
import { NextResponse } from "next/server";

// Create instance of JamAI
const jamai = new JamAI({
    baseURL: process.env.NEXT_PUBLIC_JAMAI_BASEURL,
    apiKey: process.env.JAMAI_API_KEY,
    projectId: process.env.JAMAI_PROJECT_ID,
});

// GET handler for listing tables
export async function GET() {
    try {
        const data = await jamai.listTables({
            table_type: "action",
        });
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching tables:", error?.response || error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
