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

const BASE_URL = import.meta.env.VITE_BASE_URL;

const NegativeEmotionsBreakdown = ({ filteredData }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Aggregate filteredData or fetch from API
  useEffect(() => {
    if (filteredData && filteredData.length > 0) {
      // Aggregate counts by category and negative sentiment label from filteredData
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
        const response = await axios.get(`${BASE_URL}/api/feedback/negative-emotions-breakdown`);
        setData(response.data);
      } catch (err) {
        setError(err.message || "Failed to fetch negative emotions data");
      } finally {
        setLoading(false);
      }
    }
    fetchNegativeData();
  }, [filteredData]);

  if (loading) return <div>Loading negative emotions breakdown...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;
  if (!data.length) return <div>No negative emotions data available.</div>;

  return (
    <Card className="lg:col-span-2 flex flex-col mt-10 w-full h-130 bg-white dark:bg-[#0f172a] rounded-lg shadow-md">
      <CardHeader className="px-4 pt-4 pb-1">
        <CardTitle className="text-gray-900 dark:text-gray-100 text-base font-semibold">
          Negative Emotions Breakdown
        </CardTitle>
        <CardDescription className="text-gray-700 dark:text-gray-400">
          Distribution of negative emotions across categories over time
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-4 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ bottom: 90 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" tick={{ fill: "#475569" }} interval={0} angle={-45} textAnchor="end" />
            <YAxis tick={{ fill: "#475569" }} />
            <Tooltip />
            <Legend verticalAlign="top" />
            <Line type="monotone" dataKey="negative" stroke="#6366F1" name="Negative" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default NegativeEmotionsBreakdown;
