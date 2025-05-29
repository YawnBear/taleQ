import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const columns = searchParams.get('columns');
        console.log('Columns parameter:', columns);

        if (!columns) {
            return NextResponse.json({ 
                success: false, 
                error: 'Columns parameter is required' 
            }, { status: 400 });
        }

        const columnParams = columns.split(',')
            .map(col => `columns=${encodeURIComponent(col.trim())}`)
            .join('&');

        const apiUrl = `https://api.jamaibase.com/api/v1/gen_tables/action/${process.env.JAMAI_ACTION_TABLE_ID}/export_data?delimiter=%2C&${columnParams}`;
        console.log('API URL:', apiUrl);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'text/csv', 
                'Authorization': `Bearer ${process.env.JAMAI_API_KEY}`,
                'X-PROJECT-ID': process.env.JAMAI_PROJECT_ID
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            let error;
            try {
                const errorData = JSON.parse(errorText);
                error = errorData.message || errorText;
            } catch {
                error = errorText;
            }
            return NextResponse.json({ 
                success: false, 
                error: error || 'Failed to export data' 
            }, { status: response.status });
        }

        // Read the response once
        const responseData = await response.text();

        // Return as CSV regardless of content type
        return new NextResponse(responseData, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename=resumes_export_${new Date().toISOString().split('T')[0]}.csv`
            }
        });

    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Internal server error' 
        }, { status: 500 });
    }
}