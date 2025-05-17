import { NextResponse } from "next/server";

export async function GET() {
  const url = `${process.env.NEXT_PUBLIC_JAMAI_BASEURL}api/v1/gen_tables/action`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JAMAI_API_KEY}`,
        "X-PROJECT-ID": process.env.JAMAI_PROJECT_ID,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("JamAI API error:", errorText);
      return NextResponse.json({ message: "Failed to fetch tables" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error fetching tables:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
