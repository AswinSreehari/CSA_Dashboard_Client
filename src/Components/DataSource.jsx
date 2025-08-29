import React, { useEffect, useState } from "react";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const DataSource = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all data source or raw feedback data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/api/feedback/data-source`);  
          setData(res.data);
      } catch (err) {
        setError(err.message || "Failed to fetch data source");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div>Loading data source...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">Error: {error}</div>;

  if (!data.length)
    return <div className="p-4 text-gray-600 dark:text-gray-400">No data available.</div>;

  return (
    <div className="p-6 bg-white dark:bg-[#0f172a] rounded-lg shadow min-h-[80vh] overflow-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Data Source</h2>
      {/* Render your data as a simple table or custom UI */}
      <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300 border-collapse border border-gray-200 dark:border-gray-700">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            {/* Replace these headers with your actual data keys */}
             <th className="border border-gray-300 p-2">Date</th>
            <th className="border border-gray-300 p-2">Category</th>
            <th className="border border-gray-300 p-2">Source</th>
            <th className="border border-gray-300 p-2">Model</th>
            <th className="border border-gray-300 p-2">Sentiment</th>
           </tr>
        </thead>
        <tbody>
          {data.map((item) => (
  <tr key={item.id || item._id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-[#0f172a] dark:even:bg-[#162536]">
    <td className="border border-gray-300 p-2">
      {item.date ? new Date(item.date).toLocaleDateString("en-IN", { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}
    </td>
    <td className="border border-gray-300 p-2">{item.category || "-"}</td>
    <td className="border border-gray-300 p-2">{item.source || "-"}</td>
    <td className="border border-gray-300 p-2">{item.model || "-"}</td>
    <td className="border border-gray-300 p-2">{item.sentiment?.label || "-"}</td>
  </tr>
))}

        </tbody>
      </table>
    </div>
  );
};

export default DataSource;
