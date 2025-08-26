"use client";

import React, { useState, useEffect } from "react";
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

const BASE_URL = import.meta.env.VITE_BASE_URL;

const COLORS = [
  "#6366F1", "#60A5FA", "#2563EB", "#1E40AF",
  "#9333EA", "#8B5CF6", "#A78BFA", "#C4B5FD"
];

const ProductMentionsTreemap = ({ filteredData }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  if (loading) return <div>Loading product mentions treemap...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;
  if (!data || data.length === 0) return <div>No product mention data available.</div>;

  return (
    <Card className="lg:col-span-2 flex flex-col w-full h-160 bg-white dark:bg-[#0f172a] rounded-lg shadow-md">
      <CardHeader className="px-4 pt-4 pb-1">
        <CardTitle className="text-gray-900 dark:text-gray-100 text-base font-semibold">
          Product Mentions Treemap
        </CardTitle>
        <CardDescription className="text-gray-700 dark:text-gray-400">
          Visual representation of product mention volume
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-4 w-full">
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
      </CardContent>
    </Card>
  );
};

export default ProductMentionsTreemap;
