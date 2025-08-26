"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as echarts from "echarts/core";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from "echarts/components";
import { BarChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../Components/ui/card";

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  CanvasRenderer,
]);

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Helper to prepare waterfall data from filteredData
function prepareWaterfallData(filteredData) {
  const categoryMap = {};
  filteredData.forEach(({ category, sentiment }) => {
    if (sentiment?.label === "negative" || sentiment?.label === "very negative") {
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    }
  });

  const sortedCategories = Object.keys(categoryMap).sort();
  const negativeDriversData = [];
  const placeholderData = [];
  let cumulative = 0;
  const categories = ["Total", ...sortedCategories, "Closure"];

  // Total negative count
  const totalNegative = Object.values(categoryMap).reduce((a, b) => a + b, 0);
  negativeDriversData.push(totalNegative);
  placeholderData.push(0);

  for (const cat of sortedCategories) {
    placeholderData.push(totalNegative - cumulative);
    negativeDriversData.push(categoryMap[cat]);
    cumulative += categoryMap[cat];
  }

  placeholderData.push(0);
  negativeDriversData.push(0);

  return {
    categories,
    placeholderData,
    negativeDriversData,
  };
}

const TopNegativeDriversWaterfallChart = ({ filteredData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [chartData, setChartData] = useState({
    categories: [],
    placeholderData: [],
    negativeDriversData: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update chart data when filteredData changes
  useEffect(() => {
    if (filteredData && filteredData.length > 0) {
      setChartData(prepareWaterfallData(filteredData));
      setLoading(false);
      setError(null);
    } else {
      async function fetchData() {
        try {
          setLoading(true);
          setError(null);
          const res = await axios.get(`${BASE_URL}/api/feedback/top-negative-drivers`);
          setChartData(res.data);
        } catch (err) {
          setError(err.message || "Failed to fetch waterfall chart data");
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    }
  }, [filteredData]);

  useEffect(() => {
    if (!chartRef.current || chartData.categories.length === 0) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }
    const chart = chartInstance.current;

    const option = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: function (params) {
          const tar = params[1];
          return `${tar.name}<br/>${tar.seriesName}: ${tar.value}`;
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "10%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        splitLine: { show: false },
        data: chartData.categories,
        axisLabel: { rotate: 30 },
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          name: "Placeholder",
          type: "bar",
          stack: "Total",
          itemStyle: {
            borderColor: "transparent",
            color: "transparent",
          },
          emphasis: {
            itemStyle: {
              borderColor: "transparent",
              color: "transparent",
            },
          },
          data: chartData.placeholderData,
        },
        {
          name: "Negative Impact",
          type: "bar",
          stack: "Total",
          label: {
            show: true,
            position: "inside",
          },
          data: chartData.negativeDriversData,
          itemStyle: {
            color: "#6475d7", // Customize as needed
          },
        },
      ],
    };

    chart.setOption(option);

    return () => {
      chart.dispose();
      chartInstance.current = null;
    };
  }, [chartData]);

  if (loading) return <div>Loading Top Negative Drivers data...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;

  return (
    <Card className="lg:col-span-2 flex flex-col mt-5 w-full h-130 bg-white dark:bg-[#0f172a] rounded-lg shadow-md">
      <CardHeader className="px-4 pt-4 pb-1">
        <CardTitle className="text-gray-900 dark:text-gray-100 text-base font-semibold">
          Top Negative Drivers
        </CardTitle>
        <CardDescription className="text-gray-700 dark:text-gray-400">
          Visualization of key drivers contributing to negative sentiment
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-4 w-full">
        <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
      </CardContent>
    </Card>
  );
};

export default TopNegativeDriversWaterfallChart;
