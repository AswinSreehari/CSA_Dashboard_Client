"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  Treemap,
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

const COLORS = [
  "#6366F1", "#60A5FA", "#2563EB", "#1E40AF",
  "#9333EA", "#8B5CF6", "#A78BFA", "#C4B5FD"
];

const ProductMentionsTreemap = ({ filteredData }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [showData, setShowData] = useState(false);

  const chartRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      // Use filteredData aggregation if available
      if (filteredData && filteredData.length > 0) {
        const countMap = {};
        filteredData.forEach(({ model = "Unknown" }) => {
          countMap[model] = (countMap[model] || 0) + 1;
        });
        const aggregated = Object.entries(countMap).map(([name, size]) => ({
          name,
          size,
        }));
        setData(aggregated);
        setLoading(false);
        setError(null);
        return;
      }

      // Else fetch from API
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${BASE_URL}/api/feedback/product-mentions`);
        setData(response.data);
      } catch (err) {
        setError(err.message || "Failed to fetch product mentions data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filteredData]);

  const downloadCSV = () => {
    if (!data.length) return;
    const header = ["Product Model", "Mentions"];
    const rows = data.map(({ name, size }) => [name, size]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "product-mentions.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div>Loading product mentions treemap...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;
  if (!data || data.length === 0) return <div>No product mention data available.</div>;

  return (
    <>
      {/* Main card clickable to open modal */}
      <Card
        className="lg:col-span-2 flex flex-col w-full h-160 bg-white dark:bg-[#0f172a] rounded-lg shadow-md cursor-pointer hover:ring-2 ring-blue-500"
        onClick={() => setModalOpen(true)}
        ref={chartRef}
        tabIndex={0}
        role="button"
        aria-label="Open product mentions details"
      >
        <CardHeader className="px-4 pt-4 pb-1 flex justify-between items-center">
          <div>
            <CardTitle className="text-gray-900 dark:text-gray-100 text-base font-semibold">
              Product Mentions Treemap
            </CardTitle>
            <CardDescription className="text-gray-700 dark:text-gray-400">
              Visual representation of product mention volume
            </CardDescription>
          </div>
           
        </CardHeader>
        <CardContent className="flex-1 p-4 w-full">
          {showData ? (
            <div className="max-h-[400px] overflow-y-auto border border-gray-300 dark:border-gray-700 rounded">
              <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2">Product Model</th>
                    <th className="px-3 py-2">Mentions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(({ name, size }) => (
                    <tr className="border-b border-gray-200 dark:border-gray-700" key={name}>
                      <td className="px-3 py-2 font-medium">{name}</td>
                      <td className="px-3 py-2">{size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                width="100%"
                height="100%"
                data={data}
                dataKey="size"
                ratio={4 / 3}
                stroke="#fff"
                fill="#8884d8"
                content={({ depth, x, y, width, height, name, size, index }) => {
                  const color = COLORS[index % COLORS.length];
                  return (
                    <g>
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        style={{ fill: color, stroke: "#fff" }}
                      />
                      {width > 60 && height > 20 && (
                        <text
                          x={x + width / 2}
                          y={y + height / 2}
                          textAnchor="middle"
                          fill="#fff"
                          fontSize={14}
                          pointerEvents="none"
                        >
                          {name}
                        </text>
                      )}
                      {width > 60 && height > 40 && (
                        <text
                          x={x + width / 2}
                          y={y + height / 2 + 18}
                          textAnchor="middle"
                          fill="#eee"
                          fontSize={12}
                          pointerEvents="none"
                        >
                          {size} mentions
                        </text>
                      )}
                    </g>
                  );
                }}
              >
                <Tooltip formatter={(value, name) => [`${value} mentions`, name]} />
              </Treemap>
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
          title="Product Mentions Treemap"
          description="Visual representation of product mention volume."
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
                    <th className="px-3 py-2">Product Model</th>
                    <th className="px-3 py-2">Mentions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(({ name, size }) => (
                    <tr className="border-b border-gray-200 dark:border-gray-700" key={name}>
                      <td className="px-3 py-2 font-medium">{name}</td>
                      <td className="px-3 py-2">{size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <Treemap
                width="100%"
                height="100%"
                data={data}
                dataKey="size"
                ratio={4 / 3}
                stroke="#fff"
                fill="#8884d8"
                content={({ depth, x, y, width, height, name, size, index }) => {
                  const color = COLORS[index % COLORS.length];
                  return (
                    <g>
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        style={{ fill: color, stroke: "#fff" }}
                      />
                      {width > 60 && height > 20 && (
                        <text
                          x={x + width / 2}
                          y={y + height / 2}
                          textAnchor="middle"
                          fill="#fff"
                          fontSize={14}
                          pointerEvents="none"
                        >
                          {name}
                        </text>
                      )}
                      {width > 60 && height > 40 && (
                        <text
                          x={x + width / 2}
                          y={y + height / 2 + 18}
                          textAnchor="middle"
                          fill="#eee"
                          fontSize={12}
                          pointerEvents="none"
                        >
                          {size} mentions
                        </text>
                      )}
                    </g>
                  );
                }}
              >
                <Tooltip formatter={(value, name) => [`${value} mentions`, name]} />
              </Treemap>
            </ResponsiveContainer>
          )}
        </DetailsModal>
      )}
    </>
  );
};

export default ProductMentionsTreemap;
