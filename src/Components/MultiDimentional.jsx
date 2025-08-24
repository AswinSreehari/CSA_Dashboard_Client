"use client";

import React, { useEffect, useState, useMemo } from "react";
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

// Helper: aggregate filtered feedback into radar chart data shape
const aggregateFilteredData = (rawData) => {
  // Initialize data structure for categories with zero scores for each brand
  const radarDataMap = {};
  CATEGORIES.forEach((cat) => {
    radarDataMap[cat] = { category: cat };
  });

  // Initialize brand set
  const brandsSet = new Set();

  // Aggregate sentiment scores by category and brand
  rawData.forEach(({ category, brand, sentiment }) => {
    if (!category || !brand || !sentiment) return;
    if (!radarDataMap[category]) radarDataMap[category] = { category };
    brandsSet.add(brand);

    // You can customize this scoring logic as needed
    // Example: positive = 100, neutral = 50, negative = 0
    let score = 50;
    if (sentiment.label === "positive") score = 100;
    else if (sentiment.label === "negative") score = 0;

    // Accumulate average per brand-category (simplification)
    if (!radarDataMap[category][brand]) {
      radarDataMap[category][brand] = { totalScore: 0, count: 0 };
    }
    radarDataMap[category][brand].totalScore += score;
    radarDataMap[category][brand].count += 1;
  });

  // Compute averages
  const result = Object.entries(radarDataMap).map(([category, brandScores]) => {
    const obj = { category };
    brandsSet.forEach((brand) => {
      if (brandScores[brand]) {
        obj[brand] = brandScores[brand].totalScore / brandScores[brand].count;
      } else {
        obj[brand] = 0;
      }
    });
    return obj;
  });

  return { data: result, brands: Array.from(brandsSet) };
};

const MultiDimensionalComparison = ({ filteredData }) => {
  const [chartData, setChartData] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  if (loading) return <div>Loading comparison chart...</div>;
  if (error)
    return (
      <div className="text-red-600 dark:text-red-400">Error: {error}</div>
    );

  return (
    <Card className="bg-white dark:bg-[#0f172a] w-180 mt-10 rounded-lg p-6 ">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]"></span>
          Multi-dimensional Comparison
        </CardTitle>
        <CardDescription className="text-gray-700 dark:text-gray-400">
          Comprehensive sentiment analysis across key categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={420}>
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius={150}
            data={chartData}
            style={{
              fontFamily: "inherit",
            }}
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
      </CardContent>
    </Card>
  );
};

export default MultiDimensionalComparison;
