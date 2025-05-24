import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { selectedColumns } = await request.json();

        // Get visible columns for display
        const visibleColumns = Object.entries(selectedColumns)
            .filter(([_, isSelected]) => isSelected)
            .map(([column]) => column);

        // Always include email address and name for functionality
        const requiredColumns = ['email address', 'name'];
        const allColumns = [...new Set([...visibleColumns, ...requiredColumns])];

        const columnsQuery = allColumns
            .map(column => `columns=${encodeURIComponent(column)}`)
            .join('&');

        const response = await fetch(
            `https://api.jamaibase.com/api/v1/gen_tables/action/${process.env.JAMAI_ACTION_TABLE_ID}/rows?${columnsQuery}`,
            {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    authorization: `Bearer ${process.env.JAMAI_API_KEY}`,
                    'X-PROJECT-ID': process.env.JAMAI_PROJECT_ID
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch resumes: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        return NextResponse.json({ 
            success: true,
            items: data.items || [],
            total: data.total || 0
        });
        
    } catch (error) {
        console.error('Error fetching resumes:', error);
        return NextResponse.json({ 
            success: false,
            error: 'Failed to fetch resumes',
            message: error.message 
        }, { status: 500 });
    }
}