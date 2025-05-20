

export default function Resume() {
    const [tableData, setTableData] = useState();
    const [currentPage, setCurrentPage] = useState("jobPosition");
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/jamai");
                if (response.ok) {
                    const data = await response.json();
                    setTableData(data);
                    setFilteredData(data);
                } else {
                    console.error("Failed to fetch data:", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
}