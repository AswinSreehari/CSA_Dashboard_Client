"use client";

import React, { useEffect, useRef, useState } from "react";
import { BsClipboard2Data } from "react-icons/bs";
import { IoBarChartOutline } from "react-icons/io5";
import { FaFileDownload } from "react-icons/fa";
import { FaShare } from "react-icons/fa";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;
import html2canvas from "html2canvas";


const SentimentOvertime = ({ filteredData }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showData, setShowData] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    async function fetchSentimentOverTime() {
      // If filteredData is present and non-empty, skip fetching default data
      if (filteredData && filteredData.length > 0) {
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

  const downloadCSV = () => {
    if (!data.length) return;
    const header = ["Date", "Positive", "Neutral", "Negative", "Net Sentiment"];
    const rows = data.map(d => [d.created_at, d.positive || 0, d.neutral || 0, d.negative || 0, d.net_sentiment || 0]);
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "sentiment-overtime.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const takeScreenshot = () => {
    if (!chartRef.current) return;
    html2canvas(chartRef.current, { backgroundColor: null }).then(canvas => {
      const link = document.createElement("a");
      link.download = "sentiment-overtime.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  const shareChart = () => {
    if (navigator.share) {
      navigator.share({
        title: "Sentiment Over Time",
        text: "Check out this sentiment over time chart!",
        url: window.location.href,
      }).catch(() => alert("Sharing failed or cancelled"));
    } else {
      alert("Share not supported in this browser.");
    }
  };

  if (loading) return <div>Loading sentiment over time...</div>;
  if (error)
    return <div className="text-red-600 dark:text-red-400">Error: {error}</div>;

  return (
    <div ref={chartRef} className="w-198 ml-5 my-10 rounded-lg p-6 bg-white dark:bg-[#0f172a] shadow-md">
      <div className="flex items-center justify-between">

        <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">

          Sentiment Over Time
        </h2>
        <div className="flex gap-3 mb-4 ">
          <button onClick={() => setShowData(!showData)} className="bg-gray-200 cursor-pointer dark:bg-gray-700 rounded px-3 py-1 hover:bg-gray-300 dark:hover:bg-gray-600">{showData ? <IoBarChartOutline size={20} /> : <BsClipboard2Data size={20} /> }</button>
          <button onClick={downloadCSV} className="bg-gray-200 cursor-pointer dark:bg-gray-700 rounded px-3 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"><FaFileDownload size={20} /></button>
          <button onClick={shareChart} className="bg-gray-200 cursor-pointer dark:bg-gray-700 rounded px-3 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"><FaShare size={20} /></button>
        </div>


      </div>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Track sentiment changes for Google Pixel mentions
      </p>

      {showData ? (
       <div className="max-h-[350px] overflow-y-auto border border-gray-300 dark:border-gray-700 rounded">
  <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
    <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 sticky top-0 z-10">
      <tr>
        <th className="px-3 py-2">Date</th>
        <th className="px-3 py-2">Positive</th>
        <th className="px-3 py-2">Neutral</th>
        <th className="px-3 py-2">Negative</th>
        <th className="px-3 py-2">Net Sentiment</th>
      </tr>
    </thead>
    <tbody>
      {data.map((row) => (
        <tr key={row.created_at} className="border-b border-gray-200 dark:border-gray-700">
          <td className="px-3 py-2">{row.created_at}</td>
          <td className="px-3 py-2">{row.positive}</td>
          <td className="px-3 py-2">{row.neutral}</td>
          <td className="px-3 py-2">{row.negative}</td>
          <td className="px-3 py-2">{row.net_sentiment}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

      ) : (


        <ResponsiveContainer width="100%" height={350}>
          <AreaChart
            data={data}
            margin={{ left: 20 }}
          >
            <defs>
              <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a1a1aa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a1a1aa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorNetSentiment" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>

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

            {/* Negative Area */}
            <Area
              type="monotone"
              dataKey="negative"
              stroke="#ef4444"
              fill="url(#colorNegative)"
              strokeWidth={2}
              name="Negative"
              className="dark:stroke-red-500"
            />

            {/* Neutral Area */}
            <Area
              type="monotone"
              dataKey="neutral"
              stroke="#a1a1aa"
              fill="url(#colorNeutral)"
              strokeWidth={2}
              name="Neutral"
              className="dark:stroke-gray-400"
            />

            {/* Positive Area */}
            <Area
              type="monotone"
              dataKey="positive"
              stroke="#22c55e"
              fill="url(#colorPositive)"
              strokeWidth={2}
              name="Positive"
              className="dark:stroke-green-500"
            />

            {/* Net Sentiment Area (dashed stroke) */}
            <Area
              type="monotone"
              dataKey="net_sentiment"
              stroke="#3b82f6"
              fill="url(#colorNetSentiment)"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Net Sentiment"
              className="dark:stroke-blue-500"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default SentimentOvertime;
