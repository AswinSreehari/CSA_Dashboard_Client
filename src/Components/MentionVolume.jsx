"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  LabelList,
  AreaChart,
} from "recharts";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const MentionVolume = ({ filteredData }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Aggregate filteredData by date if filteredData is provided
  const aggregatedData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return null;

    const agg = {};
    filteredData.forEach((item) => {
      const dateStr = item.date ? item.date.slice(0, 10) : "Unknown"; 
      if (!agg[dateStr]) {
        agg[dateStr] = { created_at: dateStr, mention_count: 0 };
      }
      agg[dateStr].mention_count += 1;
    });

    // Convert object to sorted array by date
    return Object.values(agg).sort((a, b) => a.created_at.localeCompare(b.created_at));
  }, [filteredData]);

  // Data source: use aggregated filteredData or API data
  const dataSource = aggregatedData ?? data;

  useEffect(() => {
    // Fetch default data only if no filteredData
    if (filteredData && filteredData.length > 0) {
      setLoading(false);
      setError(null);
      return;
    }

    async function fetchMentionVolume() {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${BASE_URL}/api/feedback/mention-volume`);
        setData(res.data);
      } catch (err) {
        setError(err.message || "Failed to fetch mention volume");
      } finally {
        setLoading(false);
      }
    }
    fetchMentionVolume();
  }, [filteredData]);

  const maxY =
    dataSource.length > 0 ? Math.max(...dataSource.map((d) => d.mention_count)) : 0;
  const top = maxY + 50;

  if (loading) return <div>Loading mention volume...</div>;
  if (error)
    return (
      <div className="text-red-600 dark:text-red-400">Error: {error}</div>
    );

  return (
    <div className="w-full rounded-lg p-6 bg-white dark:bg-[#0f172a] shadow-md">
      <h2 className="mb-2 font-semibold text-gray-900 dark:text-white">
        Mention Volume Over Time
      </h2>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Track the volume of mentions for Google Pixel
      </p>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={dataSource} margin={{ left: 20 }}>
          <defs>
            <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="4 6"
            stroke="#cbd5e1"
            className="dark:stroke-gray-700"
          />
          <XAxis
            dataKey="created_at"
            stroke="#475569"
            tick={{ fill: "#475569" }}
            className="dark:text-gray-300"
            axisLine={{ stroke: "#334155" }}
            tickLine={false}
          />
          <YAxis
            stroke="#475569"
            tick={{ fill: "#475569" }}
            className="dark:text-gray-300"
            axisLine={{ stroke: "#334155" }}
            tickLine={false}
            domain={[0, top]}
            label={{
              value: "Mentions",
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

          <Area
            type="monotone"
            dataKey="mention_count"
            stroke="none"
            fill="url(#colorBlue)"
            fillOpacity={1}
            isAnimationActive={false}
          />

          <Line
            type="monotone"
            dataKey="mention_count"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#3b82f6", stroke: "#1d4ed8", strokeWidth: 1 }}
            isAnimationActive={false}
            activeDot={{ r: 5 }}
          >
            <LabelList
              dataKey="mention_count"
              position="top"
              fill="#93c5fd"
              fontSize={12}
              offset={8}
            />
          </Line>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MentionVolume;
