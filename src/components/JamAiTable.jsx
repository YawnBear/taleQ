export default function TableQ({ tableData }) {
    return (
        <>
            <div>taleQ</div>
            <div className="space-y-6">
                <h1 className="text-4xl">List of Tables</h1>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Table ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Columns
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-black">
                        {tableData?.items?.map((table) => (
                            <tr key={table.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{table.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <ul className="space-y-2">
                                        {table.cols.map((column) => (
                                            <li key={column.id}>
                                                <span>{column.id}: </span>
                                                <span>{column.dtype}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}