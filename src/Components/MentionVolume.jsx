"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
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
import DetailsModal from "./DetailsModal";
import { shareChart } from "../lib/Sharechart";
import Loader from "./Loader";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const MentionVolume = ({ filteredData }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [showData, setShowData] = useState(false);

  const chartRef = useRef(null);

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
    return Object.values(agg).sort((a, b) =>
      a.created_at.localeCompare(b.created_at)
    );
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

  const downloadCSV = () => {
    if (!dataSource.length) return;
    const header = ["Date", "Mention Count"];
    const rows = dataSource.map((d) => [d.created_at, d.mention_count || 0]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "mention-volume.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderAreaChart = () => (
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
  );

  if (loading) return <div><Loader /></div>;
  if (error) return <div className="text-red-600 dark:text-red-400">Error: {error}</div>;

  return (
    <>
      {/* Main chart card - clickable to open modal */}
      <div
        ref={chartRef}
        className="w-full rounded-lg p-6 bg-white dark:bg-[#0f172a] mt-0 shadow-md cursor-pointer hover:ring-2 ring-blue-500"
        onClick={() => setModalOpen(true)}
        tabIndex={0}
        role="button"
        aria-label="Open mention volume details"
      >
        <div className="flex items-center justify-between">
          <h2 className="mb-2 font-semibold text-gray-900 dark:text-white">
            Mention Volume Over Time
          </h2>
          
        </div>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Track the volume of mentions for Google Pixel
        </p>

        {showData ? (
          <div className="max-h-[320px] overflow-y-auto border border-gray-300 dark:border-gray-700 rounded">
            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Mention Count</th>
                </tr>
              </thead>
              <tbody>
                {dataSource.map((row) => (
                  <tr key={row.created_at} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-3 py-2">{row.created_at}</td>
                    <td className="px-3 py-2">{row.mention_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          renderAreaChart()
        )}
      </div>

      {/* Details Modal */}
      {modalOpen && (
        <DetailsModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setShowData(false); // Reset preview on modal close
          }}
          title="Mention Volume Over Time"
          description="This chart shows the volume of mentions for Google Pixel over time."
          onPreview={() => setShowData((v) => !v)}
          onDownload={downloadCSV}
          onShare={shareChart}
          previewActive={showData}
        >
          {showData ? (
            <div className="max-h-[320px] overflow-y-auto border border-gray-300 dark:border-gray-700 rounded">
              <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Mention Count</th>
                  </tr>
                </thead>
                <tbody>
                  {dataSource.map((row) => (
                    <tr key={row.created_at} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-3 py-2">{row.created_at}</td>
                      <td className="px-3 py-2">{row.mention_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            renderAreaChart()
          )}
        </DetailsModal>
      )}
    </>
  );
};

export default MentionVolume;
