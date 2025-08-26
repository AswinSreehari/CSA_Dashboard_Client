"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as echarts from "echarts/core";
import {
  TooltipComponent,
  GridComponent,
  VisualMapComponent,
} from "echarts/components";
import { HeatmapChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../Components/ui/card";

echarts.use([
  TooltipComponent,
  GridComponent,
  VisualMapComponent,
  HeatmapChart,
  CanvasRenderer,
]);

const BASE_URL = import.meta.env.VITE_BASE_URL;

const hours = [
  "12a", "1a", "2a", "3a", "4a", "5a", "6a",
  "7a", "8a", "9a", "10a", "11a",
  "12p", "1p", "2p", "3p", "4p", "5p",
  "6p", "7p", "8p", "9p", "10p", "11p"
];
const days = [
  "Saturday", "Friday", "Thursday",
  "Wednesday", "Tuesday", "Monday", "Sunday"
];

function transformData(rawData) {
  const emotionIndex = {
    positive: 0,
    neutral: 1,
    negative: 2,
  };
  const sourceIndex = {
    Facebook: 0,
    Twitter: 1,
    Instagram: 2,
    Reddit: 3,
    Other: 4,
  };

  // Build array of [sourceIndex, emotionIndex, count]
  return rawData.map(({ emotion, source, count }) => [
    sourceIndex[source] ?? 4,
    emotionIndex[emotion] ?? 1,
    count,
  ]);
}

const aggregateFilteredData = (filteredData) => {
  // Aggregate counts by source and emotion from filteredData
  const emotionIndex = {
    positive: 0,
    neutral: 1,
    negative: 2,
  };
  const sourceIndex = {
    Facebook: 0,
    Twitter: 1,
    Instagram: 2,
    Reddit: 3,
    Other: 4,
  };

  const countMap = {};

  filteredData.forEach(({ source = "Other", emotion = "neutral" }) => {
    const sIdx = sourceIndex[source] ?? 4;
    const eIdx = emotionIndex[emotion] ?? 1;
    const key = `${sIdx}-${eIdx}`;
    countMap[key] = (countMap[key] || 0) + 1;
  });

  return Object.entries(countMap).map(([key, count]) => {
    const [s, e] = key.split("-").map(Number);
    return [s, e, count];
  });
};

const EmotionSourceHeatmap = ({ filteredData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (filteredData && filteredData.length > 0) {
      const aggregated = aggregateFilteredData(filteredData);
      setHeatmapData(aggregated);
      setLoading(false);
      setError(null);
      return;
    }

    async function fetchHeatmapData() {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${BASE_URL}/api/feedback/emotion-source-heatmap`);
        const transformed = transformData(res.data);
        setHeatmapData(transformed);
      } catch (err) {
        setError(err.message || "Failed to fetch heatmap data");
      } finally {
        setLoading(false);
      }
    }
    fetchHeatmapData();
  }, [filteredData]);

  useEffect(() => {
    if (!chartRef.current || !heatmapData.length) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }
    const chart = chartInstance.current;

    const option = {
      tooltip: {
        position: "top",
        formatter: function (params) {
          const sourceNames = ["Facebook", "Twitter", "Instagram", "Reddit", "Other"];
          const emotionNames = ["positive", "neutral", "negative"];
          return `${sourceNames[params.data[0]]} × ${emotionNames[params.data[1]]}: ${params.data[2]} mentions`;
        },
      },
      grid: { height: "50%", top: "10%" },
      xAxis: {
        type: "category",
        data: ["Facebook", "Twitter", "Instagram", "Reddit", "Other"],
        splitArea: { show: true },
        name: "Source",
        nameLocation: "middle",
        nameGap: 30,
      },
      yAxis: {
        type: "category",
        data: ["positive", "neutral", "negative"],
        splitArea: { show: true },
        name: "Emotion",
        nameLocation: "middle",
        nameGap: 40,
      },
      visualMap: {
        min: 0,
        max: Math.max(...heatmapData.map((d) => d[2])),
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: "5%",
        inRange: {
          color: ["#e0f3f8", "#abd9e9", "#74add1", "#4575b4", "#313695"],
        },
        textStyle: {
          color: "#ffffff",
          fontSize: 12,
        },
      },
      series: [
        {
          name: "Emotion × Source",
          type: "heatmap",
          data: heatmapData,
          label: { show: false },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };

    chart.setOption(option);

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });

    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
      chartInstance.current = null;
    };
  }, [heatmapData]);

  if (loading) return <div>Loading emotion × source heatmap...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;
  if (!heatmapData.length) return <div>No heatmap data available.</div>;

  return (
    <Card className="lg:col-span-2 flex flex-col mt-10 w-full h-[480px] bg-white dark:bg-[#0f172a] rounded-lg shadow-md">
      <CardHeader className="px-4 pt-4 pb-1">
        <CardTitle className="text-gray-900 dark:text-gray-100 text-base font-semibold">
          Emotion Source Heatmap
        </CardTitle>
        <CardDescription className="text-gray-700 dark:text-gray-400">
          Visualizing emotion distribution across platforms
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-4 w-full">
        <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
      </CardContent>
    </Card>
  );
};

export default EmotionSourceHeatmap;
