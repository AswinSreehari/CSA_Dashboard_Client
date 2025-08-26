"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
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

const BASE_URL = import.meta.env.VITE_BASE_URL;

const BrandComparisonChart = ({ filteredData }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  if (loading) return <div>Loading brand comparison data...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;
  if (data.length === 0) return <div>No brand comparison data available.</div>;

  return (
    <Card className="lg:col-span-2 flex flex-col mt-10 w-full h-[480px] bg-white dark:bg-[#0f172a] rounded-lg shadow-md">
      <CardHeader className="px-4 pt-4 pb-1">
        <CardTitle className="text-gray-900 dark:text-gray-100 text-base font-semibold">
          Brand Comparison
        </CardTitle>
        <CardDescription className="text-gray-700 dark:text-gray-400">
          Comparing multiple metrics across brands
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-4 w-full">
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
            <Tooltip />
            {/* <Legend /> */}
            <Bar dataKey="mentions" fill="#6366F1" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BrandComparisonChart;
