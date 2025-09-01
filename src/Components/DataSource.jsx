import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "./Loader";
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

  if (loading) return <div><Loader /></div>;
  if (error) return <div className="text-red-600 dark:text-red-400">Error: {error}</div>;
  if (!data.length)
    return <div className="p-4 text-gray-600 dark:text-gray-400">No data available.</div>;

  return (
    <div className="p-2 sm:p-6 bg-white dark:bg-[#0f172a] rounded-lg shadow min-h-[80vh]">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Data Source</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max table-auto text-left border-collapse border border-gray-200 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="border border-gray-300 px-1 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium truncate w-20">Date</th>
              <th className="border border-gray-300 px-1 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium truncate w-24">Category</th>
              <th className="border border-gray-300 px-1 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium truncate w-28">Source</th>
              <th className="border border-gray-300 px-1 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium truncate w-28">Model</th>
              <th className="border border-gray-300 px-1 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium truncate w-24">Sentiment</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.id || item._id}
                className="odd:bg-white even:bg-gray-50 dark:odd:bg-[#0f172a] dark:even:bg-[#162536]"
              >
                <td className="border border-gray-300 px-1 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm truncate">
                  {item.date
                    ? new Date(item.date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A"}
                </td>
                <td className="border border-gray-300 px-1 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm truncate">
                  {item.category || "-"}
                </td>
                <td className="border border-gray-300 px-1 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm truncate">
                  {item.source || "-"}
                </td>
                <td className="border border-gray-300 px-1 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm truncate">
                  {item.model || "-"}
                </td>
                <td className="border border-gray-300 px-1 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm truncate">
                  {item.sentiment?.label || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataSource;
