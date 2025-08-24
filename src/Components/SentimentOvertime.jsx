"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const SentimentOvertime = ({ filteredData }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSentimentOverTime() {
      // If filteredData is present and non-empty, skip fetching default data
      if (filteredData && filteredData.length > 0) {
        // Transform filteredData to the expected aggregated format
        // Assuming filteredData is an array of feedback objects with { date, sentiment, ... }

        // Aggregate counts by date and sentiment label
        const aggData = {};
        filteredData.forEach((item) => {
          const dateStr = item.date?.slice(0, 10) || "Unknown"; // Format date as YYYY-MM-DD
          if (!aggData[dateStr]) {
            aggData[dateStr] = {
              created_at: dateStr,
              positive: 0,
              neutral: 0,
              negative: 0,
              net_sentiment: 0,
            };
          }
          const label = item.sentiment?.label;
          if (label === "positive") {
            aggData[dateStr].positive += 1;
            aggData[dateStr].net_sentiment += 1;
          } else if (label === "neutral") {
            aggData[dateStr].neutral += 1;
          } else if (label === "negative") {
            aggData[dateStr].negative += 1;
            aggData[dateStr].net_sentiment -= 1;
          }
        });

        // Convert aggregation object to sorted array by date
        const aggregatedArray = Object.values(aggData).sort((a, b) =>
          a.created_at.localeCompare(b.created_at)
        );

        setData(aggregatedArray);
        setLoading(false);
        setError(null);
        return;
      }

      // If no filteredData, fetch default data from API
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${BASE_URL}/api/feedback/sentiment-overtime`);
        setData(res.data);
      } catch (err) {
        setError(err.message || "Failed to fetch sentiment over time");
      } finally {
        setLoading(false);
      }
    }
    fetchSentimentOverTime();
  }, [filteredData]);

  if (loading) return <div>Loading sentiment over time...</div>;
  if (error)
    return <div className="text-red-600 dark:text-red-400">Error: {error}</div>;

  return (
    <div className="w-198 ml-5 my-10 rounded-lg p-6 bg-white dark:bg-[#0f172a] shadow-md">
      <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">
        Sentiment Over Time
      </h2>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Track sentiment changes for Google Pixel mentions
      </p>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={data}
          margin={{ left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" className="dark:stroke-gray-700" />
          <XAxis
            dataKey="created_at"
            stroke="#475569"
            tick={{ fill: "#475569" }}
            className="dark:text-gray-300"
          />
          <YAxis
            stroke="#475569"
            tick={{ fill: "#475569" }}
            className="dark:text-gray-300"
            label={{
              value: "Sentiment Score",
              angle: -90,
              position: "insideLeft",
              dx: -8,
              dy: 20,
              fill: "#64748b",
              fontSize: "1rem",
              textAnchor: "middle",
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              borderColor: "#334155",
            }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#fff" }}
          />
          <Legend wrapperStyle={{ color: "white" }} />

          {/* Negative */}
          <Line
            type="monotone"
            dataKey="negative"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 3 }}
            name="Negative"
            className="dark:stroke-red-500"
          />

          {/* Neutral */}
          <Line
            type="monotone"
            dataKey="neutral"
            stroke="#a1a1aa"
            strokeWidth={2}
            dot={{ r: 3 }}
            name="Neutral"
            className="dark:stroke-gray-400"
          />

          {/* Positive */}
          <Line
            type="monotone"
            dataKey="positive"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ r: 3 }}
            name="Positive"
            className="dark:stroke-green-500"
          />

          {/* Net Sentiment (Dashed Blue) */}
          <Line
            type="monotone"
            dataKey="net_sentiment"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3 }}
            name="Net Sentiment"
            className="dark:stroke-blue-500"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentOvertime;
