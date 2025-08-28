"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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

const BASE_URL = import.meta.env.VITE_BASE_URL;

const NegativeEmotionsBreakdown = ({ filteredData }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [showData, setShowData] = useState(false);

  // Aggregate filteredData or fetch from API
  useEffect(() => {
    if (filteredData && filteredData.length > 0) {
      const aggMap = {};
      filteredData.forEach(({ category, sentiment }) => {
        if (sentiment?.label === "negative") {
          aggMap[category] = (aggMap[category] || 0) + 1;
        }
      });
      const aggregated = Object.entries(aggMap).map(([category, negative]) => ({
        category,
        negative,
      }));
      setData(aggregated);
      setLoading(false);
      setError(null);
      return;
    }

    async function fetchNegativeData() {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${BASE_URL}/api/feedback/negative-emotions-breakdown`
        );
        setData(response.data);
      } catch (err) {
        setError(err.message || "Failed to fetch negative emotions data");
      } finally {
        setLoading(false);
      }
    }
    fetchNegativeData();
  }, [filteredData]);

  const downloadCSV = () => {
    if (!data.length) return;
    const header = ["Category", "Negative"];
    const rows = data.map(({ category, negative }) => [category, negative]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "negative-emotions-breakdown.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div>Loading negative emotions breakdown...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;
  if (!data.length) return <div>No negative emotions data available.</div>;

  return (
    <>
      <Card
        className="lg:col-span-2 flex flex-col mt-5 w-full h-130 bg-white dark:bg-[#0f172a] rounded-lg shadow-md cursor-pointer hover:ring-2 ring-blue-500"
        onClick={() => setModalOpen(true)}
        tabIndex={0}
        role="button"
        aria-label="Open negative emotions breakdown details"
      >
        <CardHeader className="px-4 pt-4 pb-1 flex justify-between items-center">
          <div>
            <CardTitle className="text-gray-900 dark:text-gray-100 text-base font-semibold">
              Negative Emotions Breakdown
            </CardTitle>
            <CardDescription className="text-gray-700 dark:text-gray-400">
              Distribution of negative emotions across categories over time
            </CardDescription>
          </div>
           
        </CardHeader>
        <CardContent className="flex-1 p-4 w-full">
          {showData ? (
            <div className="max-h-[300px] overflow-y-auto border border-gray-300 dark:border-gray-700 rounded">
              <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Negative</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(({ category, negative }) => (
                    <tr
                      key={category}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-3 py-2 font-medium">{category}</td>
                      <td className="px-3 py-2">{negative}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ bottom: 90 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  tick={{ fill: "#475569" }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis tick={{ fill: "#475569" }} />
                <Tooltip />
                <Legend verticalAlign="top" />
                <Line
                  type="monotone"
                  dataKey="negative"
                  stroke="#6366F1"
                  name="Negative"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {modalOpen && (
        <DetailsModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setShowData(false);
          }}
          title="Negative Emotions Breakdown"
          description="Distribution of negative emotions across categories over time"
          onPreview={() => setShowData((v) => !v)}
          previewActive={showData}
          onDownload={downloadCSV}
          onShare={shareChart}
        >
          {showData ? (
            <div className="max-h-[400px] overflow-y-auto border border-gray-300 dark:border-gray-700 rounded">
              <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Negative</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(({ category, negative }) => (
                    <tr
                      key={category}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-3 py-2 font-medium">{category}</td>
                      <td className="px-3 py-2">{negative}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data} margin={{ bottom: 90 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  tick={{ fill: "#475569" }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis tick={{ fill: "#475569" }} />
                <Tooltip />
                <Legend verticalAlign="top" />
                <Line
                  type="monotone"
                  dataKey="negative"
                  stroke="#6366F1"
                  name="Negative"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </DetailsModal>
      )}
    </>
  );
};

export default NegativeEmotionsBreakdown;
