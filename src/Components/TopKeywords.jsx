import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Camera,
  Battery,
  Package,
  BatteryCharging,
  DollarSignIcon,
  LogsIcon,
} from "lucide-react";

// Map categories to icons
const iconMap = {
  Camera,
  Battery,
  Package,
  BatteryCharging,
  DollarSignIcon,
  LogsIcon,
};

const categoryToIconKey = {
  Camera: "Camera",
  Battery: "Battery",
  Package: "Package",
  Charging: "BatteryCharging",
  Pricing: "DollarSignIcon",
  Logs: "LogsIcon",
  // Add more category mappings as needed
};

const BASE_URL = import.meta.env.VITE_BASE_URL;


const TopKeywords = () => {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSentimentSummary() {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${BASE_URL}/api/feedback/sentiment-summary`);
        console.log("response-->",res)
        // Transform server data into UI format
        const mapped = res.data.map((item) => {
          // Map backend category to title and icon key
          let title = item.category || "Unknown";
          let iconKey = categoryToIconKey[title] || "LogsIcon";

          return {
            title,
            mentions: item.mentions,
            percentage: item.positivePercentage || "0%",
            icon: iconKey,
            // You can decide on color logic here: e.g. green if >50%, else red
            color: parseInt(item.positivePercentage) >= 50 ? 'green' : 'red',
          };
        });

        setKeywords(mapped);
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    fetchSentimentSummary();
  }, []);

  if (loading) {
    return <div>Loading keywords...</div>;
  }
  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div className="lg:col-span-2 mt-5 lg:w-170 mx-0">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <div className="flex justify-between mb-6 flex-col ml-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)] mr-2"></span>
            Top Keywords
          </h3>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            Most mentioned keywords and its sentiment score
          </div>
        </div>

        <div className="space-y-4">
          {keywords.map((item, i) => {
            const Icon = iconMap[item.icon];
            return (
              <div
                key={i}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <div className="p-2 rounded-lg"
                  style={{
                    backgroundColor: item.color === 'green' ? 'rgba(5,150,105,0.1)' : 'rgba(239,68,68,0.1)'
                  }}>
                  <Icon
                    className={`h-4 w-4 ${item.color === 'green' ? "text-green-600" : "text-red-600"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {item.title}
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {item.mentions} mentions
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full`}
                      style={{
                        width: item.percentage,
                        backgroundColor: item.color === 'green' ? '#059669' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
                <div
                  className={`text-xs font-medium w-10 h-6 flex items-center justify-center rounded-2xl ${
                    parseInt(item.percentage) < 50 ? "bg-red-500 text-white" : "bg-green-500 text-white"
                  }`}
                >
                  {item.percentage}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TopKeywords;
