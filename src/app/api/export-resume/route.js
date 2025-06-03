import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        console.log('Export API called');
        
        const { searchParams } = new URL(request.url);
        const columns = searchParams.get('columns');
        const filterStatus = searchParams.get('filterStatus');
        const searchQuery = searchParams.get('searchQuery');
        
        console.log('Query params:', { columns, filterStatus, searchQuery });
        
        // Get the column names to include
        const selectedColumns = columns ? columns.split(',') : [];
        console.log('Selected columns:', selectedColumns);
        
        // Build the API URL with all columns if none specified
        const apiColumns = selectedColumns.length > 0 ? selectedColumns : ['name', 'email address', 'shortlisted'];
        const columnsQuery = apiColumns
            .map(column => `columns=${encodeURIComponent(column)}`)
            .join('&');
        
        console.log('API URL query:', columnsQuery);
        
        // Fetch data from Jamaibase API
        const apiUrl = `https://api.jamaibase.com/api/v1/gen_tables/action/${process.env.JAMAI_ACTION_TABLE_ID}/rows?${columnsQuery}`;
        console.log('Fetching from:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                authorization: `Bearer ${process.env.JAMAI_API_KEY}`,
                'X-PROJECT-ID': process.env.JAMAI_PROJECT_ID
            }
        });

        console.log('API response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        let resumes = data.items || [];
        
        console.log('Fetched resumes count:', resumes.length);
        
        // Apply filters (similar to useFilteredResumes hook)
        if (resumes.length > 0) {
            // Filter by status
            if (filterStatus && filterStatus !== 'all') {
                console.log('Filtering by status:', filterStatus);
                resumes = resumes.filter(resume => 
                    resume.shortlisted?.toLowerCase() === filterStatus.toLowerCase()
                );
                console.log('After status filter:', resumes.length);
            }
            
            // Filter by search query
            if (searchQuery && searchQuery.trim()) {
                console.log('Filtering by search query:', searchQuery);
                const query = searchQuery.toLowerCase();
                resumes = resumes.filter(resume => 
                    apiColumns.some(column => {
                        const value = resume[column];
                        if (!value) return false;
                        return value.toString().toLowerCase().includes(query);
                    })
                );
                console.log('After search filter:', resumes.length);
            }
        }

        // Convert to CSV
        const csvColumns = selectedColumns.length > 0 ? selectedColumns : apiColumns;
        let csv = csvColumns.join(',') + '\n';
        
        resumes.forEach(resume => {
            const row = csvColumns.map(column => {
                // Handle quoting and escaping CSV values
                const value = resume[column] || '';
                const cellValue = String(value).replace(/"/g, '""');
                return `"${cellValue}"`;
            });
            csv += row.join(',') + '\n';
        });

        console.log('CSV generated, length:', csv.length);

        // Return CSV response
        return new NextResponse(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename=resumes_export_${new Date().toISOString().split('T')[0]}.csv`
            }
        });
        
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json(
            { message: 'Failed to export data', error: error.message },
            { status: 500 }
        );
    }
}