"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../Components/ui/card";
import DetailsModal from "./DetailsModal";
import { shareChart } from "../lib/Sharechart";

const BRAND_COLORS = {
  "Google Pixel": "#2563eb",
  "Samsung Galaxy": "#a78bfa",
  iPhone: "#d1d5db",
};

const CATEGORIES = [
  "Camera Quality",
  "Battery Life",
  "Performance",
  "Design",
  "Value for Money",
  "Software Experience",
];

const BASE_URL = import.meta.env.VITE_BASE_URL;

const aggregateFilteredData = (rawData) => {
  const radarDataMap = {};
  CATEGORIES.forEach((cat) => {
    radarDataMap[cat] = { category: cat };
  });

  const brandsSet = new Set();

  rawData.forEach(({ category, brand, sentiment }) => {
    if (!category || !brand || !sentiment) return;
    if (!radarDataMap[category]) radarDataMap[category] = { category };
    brandsSet.add(brand);

    let score = 50;
    if (sentiment.label === "positive") score = 100;
    else if (sentiment.label === "negative") score = 0;

    if (!radarDataMap[category][brand]) {
      radarDataMap[category][brand] = { totalScore: 0, count: 0 };
    }
    radarDataMap[category][brand].totalScore += score;
    radarDataMap[category][brand].count += 1;
  });

  return {
    data: Object.entries(radarDataMap).map(([category, brandScores]) => {
      const obj = { category };
      brandsSet.forEach((brand) => {
        obj[brand] = brandScores[brand]
          ? brandScores[brand].totalScore / brandScores[brand].count
          : 0;
      });
      return obj;
    }),
    brands: Array.from(brandsSet),
  };
};

const MultiDimensionalComparison = ({ filteredData }) => {
  const [chartData, setChartData] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [showData, setShowData] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    async function fetchRadarData() {
      try {
        setLoading(true);
        setError(null);

        if (filteredData && filteredData.length > 0) {
          const { data, brands } = aggregateFilteredData(filteredData);
          setChartData(data);
          setBrands(brands);
          setLoading(false);
          return;
        }

        const res = await axios.get(`${BASE_URL}/api/feedback/radar-comparison`);
        setChartData(res.data.data);
        setBrands(res.data.brands);
      } catch (err) {
        setError(
          err.message || "Failed to fetch multi-dimensional comparison data"
        );
        setChartData([]);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    }
    fetchRadarData();
  }, [filteredData]);

  const downloadCSV = () => {
    if (!chartData.length) return;
    const header = ["Category", ...brands];
    const rows = chartData.map((row) =>
      [row.category, ...brands.map((brand) => row[brand]?.toFixed(2) || 0)]
    );
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "multi-dimensional-comparison.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div>Loading comparison chart...</div>;
  if (error)
    return <div className="text-red-600 dark:text-red-400">Error: {error}</div>;

  return (
    <>
      {/* Main card clickable to open modal */}
      <Card
        className="bg-white dark:bg-[#0f172a] w-180 mt-5 rounded-lg p-6 cursor-pointer hover:ring-2 ring-blue-400"
        onClick={() => setModalOpen(true)}
        ref={chartRef}
        tabIndex={0}
        role="button"
        aria-label="Open multi-dimensional comparison details"
      >
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
              Multi-dimensional Comparison
            </CardTitle>
            <CardDescription className="text-gray-700 dark:text-gray-400">
              Comprehensive sentiment analysis across key categories
            </CardDescription>
          </div>
           
        </CardHeader>

        <CardContent>
          {showData ? (
            <div className="max-h-[420px] overflow-y-auto border border-gray-300 dark:border-gray-700 rounded">
              <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2">Category</th>
                    {brands.map((brand) => (
                      <th key={brand} className="px-3 py-2">{brand}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row) => (
                    <tr key={row.category} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-3 py-2">{row.category}</td>
                      {brands.map((brand) => (
                        <td key={brand} className="px-3 py-2">{row[brand]?.toFixed(2) || 0}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={420}>
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius={150}
                data={chartData}
                style={{ fontFamily: "inherit" }}
              >
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fill: "#8b8fa3", fontWeight: 500 }}
                  className="dark:text-gray-100"
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  axisLine={false}
                  tick={{ fill: "#64748b" }}
                />
                {brands.map((brand) => (
                  <Radar
                    key={brand}
                    name={brand}
                    dataKey={brand}
                    stroke={BRAND_COLORS[brand] || "#888888"}
                    fill={BRAND_COLORS[brand] || "#888888"}
                    fillOpacity={0.2}
                    dot={true}
                  />
                ))}
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: 18, color: "#64748b" }}
                />
              </RadarChart>
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
          title="Multi-dimensional Comparison"
          description="This chart shows comprehensive sentiment analysis across key categories."
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
                    <th className="px-3 py-2">Category</th>
                    {brands.map((brand) => (
                      <th key={brand} className="px-3 py-2">{brand}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row) => (
                    <tr key={row.category} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-3 py-2">{row.category}</td>
                      {brands.map((brand) => (
                        <td key={brand} className="px-3 py-2">{row[brand]?.toFixed(2) || 0}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
                        <div className="max-h-[49vh] no-scrollbar pr-1">

            <ResponsiveContainer width="100%" height={420}>
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius={150}
                data={chartData}
                style={{ fontFamily: "inherit" }}
              >
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fill: "#8b8fa3", fontWeight: 500 }}
                  className="dark:text-gray-100"
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  axisLine={false}
                  tick={{ fill: "#64748b" }}
                />
                {brands.map((brand) => (
                  <Radar
                    key={brand}
                    name={brand}
                    dataKey={brand}
                    stroke={BRAND_COLORS[brand] || "#888888"}
                    fill={BRAND_COLORS[brand] || "#888888"}
                    fillOpacity={0.2}
                    dot={true}
                  />
                ))}
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: 18, color: "#64748b" }}
                />
              </RadarChart>
            </ResponsiveContainer>
            </div>
          )}
        </DetailsModal>
      )}
    </>
  );
};

export default MultiDimensionalComparison;
