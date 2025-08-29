"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../Components/ui/card";
import DetailsModal from "./DetailsModal";
import { shareChart } from "../lib/Sharechart";
import Loader from "./Loader";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const TrendingRaceModel = ({ filteredData }) => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [frame, setFrame] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [showData, setShowData] = useState(false);

  const chartRef = useRef(null);

  // Aggregate filteredData or process rawData for frames
  const framesData = useMemo(() => {
    if (filteredData && filteredData.length > 0) {
      const map = {};
      filteredData.forEach(({ model = "Unknown", date }) => {
        const month = date ? new Date(date).toISOString().slice(0, 7) : "Unknown";
        if (!map[month]) map[month] = {};
        map[month][model] = (map[month][model] || 0) + 1;
      });
      const arr = Object.entries(map)
        .map(([month, models]) => ({
          date: month,
          models,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return arr.map(({ date, models }) =>
        Object.entries(models)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([model, mentions]) => ({
            model: model.toString(),
            mentions,
            date,
          }))
      );
    } else {
      if (!rawData || rawData.length === 0) return [];
      return rawData.map(({ date, models }) =>
        models
          .sort((a, b) => b.mentions - a.mentions)
          .slice(0, 10)
          .map(({ model, mentions }) => ({
            model: model.toString(),
            mentions,
            date,
          }))
      );
    }
  }, [filteredData, rawData]);

  // Animate frame progression for bar race (only when chart is shown)
  useEffect(() => {
    if (!framesData.length || showData) return; // pause animation if showing data table
    const timer = setInterval(() => {
      setFrame((prev) => (prev + 1) % framesData.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [framesData, showData]);

  // Fetch API data if no filteredData
  useEffect(() => {
    if (filteredData && filteredData.length > 0) return;

    async function fetchTrendingModels() {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${BASE_URL}/api/feedback/trending-models`);
        setRawData(res.data);
      } catch (err) {
        setError(err.message || "Failed to fetch trending models data");
      } finally {
        setLoading(false);
      }
    }

    fetchTrendingModels();
  }, [filteredData]);

  if (loading) return <div><Loader /></div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;
  if (!framesData.length) return <div>No data available</div>;

  const currentData = framesData[frame];
  const currentDate = currentData[0]?.date || "";

  const downloadCSV = () => {
    if (!framesData.length) return;
    // Flatten all frames into one combined data set for export
    // Or export only current frame
    // Here exporting full data with date for each record
    const allRows = framesData.flat();
    const header = ["Date", "Model", "Mentions"];
    const rows = allRows.map(({ date, model, mentions }) => [date, model, mentions]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "trending-race-models.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Main card clickable to open modal */}
      <Card
        className="lg:col-span-2 flex flex-col mt-0 w-full h-160 bg-white dark:bg-[#0f172a] rounded-lg shadow-md cursor-pointer hover:ring-2 ring-blue-500"
        onClick={() => setModalOpen(true)}
        ref={chartRef}
        tabIndex={0}
        role="button"
        aria-label="Open trending models details"
      >
        <CardHeader className="px-4 pt-4 pb-1 flex justify-between items-center">
          <div>
            <CardTitle className="text-gray-900 dark:text-gray-100 text-base font-semibold">
              Trending Models - {currentDate}
            </CardTitle>
            <CardDescription className="text-gray-700 dark:text-gray-400">
              Product models by mentions over time
            </CardDescription>
          </div>
           
        </CardHeader>
        <CardContent className="flex-1 p-4 w-full">
          {showData ? (
            <div className="max-h-[400px] overflow-y-auto border border-gray-300 dark:border-gray-700 rounded">
              <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2">Model</th>
                    <th className="px-3 py-2">Mentions</th>
                    <th className="px-3 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {framesData.flat().map(({ model, mentions, date }, idx) => (
                    <tr key={`${date}-${model}-${idx}`} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-3 py-2 font-medium">{model}</td>
                      <td className="px-3 py-2">{mentions}</td>
                      <td className="px-3 py-2">{date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={currentData}
                layout="vertical"
                barGap={4}
                margin={{ bottom: 20, right: 20 }}
                activeShape={null}
               >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tick={{ fill: "#475569" }}
                  allowDecimals={false}
                  label={{ value: "Mentions (units)", position: "bottom", fill: "#64748b", offset: -1 }}
                />
                <YAxis
                  dataKey="model"
                  type="category"
                  tick={{ fill: "#475569", fontWeight: "bold" }}
                  width={160}
                  interval={0}
                />
                <Tooltip 
                 cursor={false} 
 
                />
                <Bar
                  dataKey="mentions"
                  fill="#6366F1"
                  radius={[4, 4, 4, 4]}
                  barSize={24}
                  isAnimationActive={false}
                  active={false}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      {modalOpen && (
        <DetailsModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setShowData(false);
            setFrame(0);
          }}
          title="Trending Models"
          description="Product models by mentions over time displayed as an animated race chart."
          onPreview={() => {
            setShowData((v) => !v);
            setFrame(0);
          }}
          previewActive={showData}
          onDownload={downloadCSV}
          onShare={shareChart}
        >
          {showData ? (
            <div className="max-h-[400px] overflow-y-auto border border-gray-300 dark:border-gray-700 rounded">
              <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2">Model</th>
                    <th className="px-3 py-2">Mentions</th>
                    <th className="px-3 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {framesData.flat().map(({ model, mentions, date }, idx) => (
                    <tr key={`${date}-${model}-${idx}`} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-3 py-2 font-medium">{model}</td>
                      <td className="px-3 py-2">{mentions}</td>
                      <td className="px-3 py-2">{date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={currentData}
                layout="vertical"
                barGap={4}
                margin={{ bottom: 20, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tick={{ fill: "#475569" }}
                  allowDecimals={false}
                  label={{ value: "Mentions (units)", position: "bottom", fill: "#64748b", offset: -1 }}
                />
                <YAxis
                  dataKey="model"
                  type="category"
                  tick={{ fill: "#475569", fontWeight: "bold" }}
                  width={160}
                  interval={0}
                />
                <Tooltip 
                 cursor={false} 
                 
                />
                <Bar
                  dataKey="mentions"
                  fill="#6366F1"
                  radius={[4, 4, 4, 4]}
                  barSize={24}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </DetailsModal>
      )}
    </>
  );
};

export default TrendingRaceModel;
