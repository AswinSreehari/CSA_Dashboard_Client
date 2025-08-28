"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

const BrandComparisonChart = ({ filteredData }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [showData, setShowData] = useState(false);

  const chartRef = useRef(null);

  useEffect(() => {
    if (filteredData && filteredData.length > 0) {
      // Aggregate filtered data by brand
      const countMap = {};
      filteredData.forEach(({ brand = "Unknown" }) => {
        countMap[brand] = (countMap[brand] || 0) + 1;
      });
      const aggregated = Object.entries(countMap).map(([brand, mentions]) => ({
        brand,
        mentions,
      }));
      setData(aggregated);
      setLoading(false);
      setError(null);
      return;
    }

    async function fetchBrandData() {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${BASE_URL}/api/feedback/brand-comparison`);
        setData(response.data);
      } catch (err) {
        setError(err.message || "Failed to fetch brand comparison data");
      } finally {
        setLoading(false);
      }
    }

    fetchBrandData();
  }, [filteredData]);

  const downloadCSV = () => {
    if (!data.length) return;
    const header = ["Brand", "Mentions"];
    const rows = data.map(({ brand, mentions }) => [brand, mentions]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "brand-comparison.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div>Loading brand comparison data...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;
  if (data.length === 0) return <div>No brand comparison data available.</div>;

  return (
    <>
      {/* Main card clickable to open modal */}
      <Card
        className="lg:col-span-2 flex flex-col mt-5 w-full h-[480px] bg-white dark:bg-[#0f172a] rounded-lg shadow-md cursor-pointer hover:ring-2 ring-blue-500"
        onClick={() => setModalOpen(true)}
        tabIndex={0}
        role="button"
        aria-label="Open brand comparison details"
        ref={chartRef}
      >
        <CardHeader className="px-4 pt-4 pb-1 flex justify-between items-center">
          <div>
            <CardTitle className="text-gray-900 dark:text-gray-100 text-base font-semibold">
              Brand Comparison
            </CardTitle>
            <CardDescription className="text-gray-700 dark:text-gray-400">
              Comparing multiple metrics across brands
            </CardDescription>
          </div>
           
        </CardHeader>
        <CardContent className="flex-1 p-4 w-full">
          {showData ? (
            <div className="max-h-[420px] overflow-y-auto border border-gray-300 dark:border-gray-700 rounded">
              <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2">Brand</th>
                    <th className="px-3 py-2">Mentions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(({ brand, mentions }) => (
                    <tr key={brand} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-3 py-2 font-medium">{brand}</td>
                      <td className="px-3 py-2">{mentions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="brand"
                  tick={{ fill: "#475569" }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fill: "#475569" }}
                  domain={[0, 500]}
                  label={{
                    value: "Mentions (units)",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#64748b",
                    offset: 10,
                    style: { textAnchor: "middle", fontSize: 14 },
                  }}
                />
                <Tooltip 
                 cursor={false} 
                />
                <Bar dataKey="mentions" fill="#6366F1" />
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
          }}
          title="Brand Comparison"
          description="Comparing multiple metrics across brands"
          onPreview={() => setShowData((v) => !v)}
          previewActive={showData}
          onDownload={downloadCSV}
          onShare={shareChart}
        >
          {showData ? (
            <div className="max-h-[420px] overflow-y-auto border border-gray-300 dark:border-gray-700 rounded">
              <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2">Brand</th>
                    <th className="px-3 py-2">Mentions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(({ brand, mentions }) => (
                    <tr key={brand} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-3 py-2 font-medium">{brand}</td>
                      <td className="px-3 py-2">{mentions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={420}>
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="brand"
                  tick={{ fill: "#475569" }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fill: "#475569" }}
                  domain={[0, 500]}
                  label={{
                    value: "Mentions (units)",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#64748b",
                    offset: 10,
                    style: { textAnchor: "middle", fontSize: 14 },
                  }}
                />
                <Tooltip
                 cursor={false} 
                />
                <Bar dataKey="mentions" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </DetailsModal>
      )}
    </>
  );
};

export default BrandComparisonChart;
