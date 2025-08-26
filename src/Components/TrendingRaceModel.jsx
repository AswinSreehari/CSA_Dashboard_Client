"use client";

import React, { useState, useEffect, useMemo } from "react";
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

const BASE_URL = import.meta.env.VITE_BASE_URL;

const TrendingRaceModel = ({ filteredData }) => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [frame, setFrame] = useState(0);

  // Aggregate filteredData or process rawData
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

  // Animate frame progression for bar race
  useEffect(() => {
    if (!framesData.length) return;
    const timer = setInterval(() => {
      setFrame((prev) => (prev + 1) % framesData.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [framesData]);

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

  if (loading) return <div>Loading trending models...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;
  if (!framesData.length) return <div>No data available</div>;

  const currentData = framesData[frame];
  const currentDate = currentData[0]?.date || "";

  return (
    <Card className="lg:col-span-2 flex flex-col mt-0 w-full h-160 bg-white dark:bg-[#0f172a] rounded-lg shadow-md">
      <CardHeader className="px-4 pt-4 pb-1">
        <CardTitle className="text-gray-900 dark:text-gray-100 text-base font-semibold">
          Trending Models - {currentDate}
        </CardTitle>
        <CardDescription className="text-gray-700 dark:text-gray-400">
          Product models by mentions over time
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-4 w-full">
        <ResponsiveContainer width="100%" height="100%">
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
            <Tooltip />
            <Bar
              dataKey="mentions"
              fill="#6366F1"
              radius={[4, 4, 4, 4]}
              barSize={24}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TrendingRaceModel;
