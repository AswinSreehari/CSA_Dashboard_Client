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
import DetailsModal from "./DetailsModal";
import { shareChart } from "../lib/Sharechart";

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  CanvasRenderer,
]);

const BASE_URL = import.meta.env.VITE_BASE_URL;

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
  const inlineChartRef = useRef(null);
  const modalChartRef = useRef(null);
  const inlineChartInstance = useRef(null);
  const modalChartInstance = useRef(null);

  const [chartData, setChartData] = useState({
    categories: [],
    placeholderData: [],
    negativeDriversData: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [showData, setShowData] = useState(false);

  const initializeChart = (containerRef, instanceRef, data) => {
    if (!containerRef.current) return;

    if (instanceRef.current) {
      instanceRef.current.dispose();
      instanceRef.current = null;
    }

    instanceRef.current = echarts.init(containerRef.current);

    const option = {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "none" },
        formatter: function (params) {
          const tar = params[1];
          return `${tar.name}<br/>${tar.seriesName}: ${tar.value}`;
        },
      },
      grid: { left: "3%", right: "4%", bottom: "10%", containLabel: true },
      xAxis: {
        type: "category",
        splitLine: { show: false },
        data: data.categories,
        axisLabel: { rotate: 30 },
      },
      yAxis: { type: "value" },
      series: [
        {
          name: "Placeholder",
          type: "bar",
          stack: "Total",
          itemStyle: { borderColor: "transparent", color: "transparent" },
          emphasis: {
            itemStyle: { borderColor: "transparent", color: "transparent" },
          },
          data: data.placeholderData,
        },
        {
          name: "Negative Impact",
          type: "bar",
          stack: "Total",
          label: { show: true, position: "inside" },
          data: data.negativeDriversData,
          itemStyle: { color: "#6475d7" },
        },
      ],
    };

    instanceRef.current.setOption(option);

    const resizeObserver = new ResizeObserver(() => {
      instanceRef.current?.resize();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      instanceRef.current?.dispose();
      instanceRef.current = null;
    };
  };

  useEffect(() => {
    if (filteredData && filteredData.length) {
      setChartData(prepareWaterfallData(filteredData));
      setLoading(false);
      setError(null);
    } else {
      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);
          const res = await axios.get(`${BASE_URL}/api/feedback/top-negative-drivers`);
          setChartData(res.data);
        } catch (err) {
          setError(err.message || "Failed to fetch data");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [filteredData]);

  useEffect(() => {
    if (!showData && chartData.categories.length) {
      const cleanup = initializeChart(inlineChartRef, inlineChartInstance, chartData);
      return cleanup;
    }
  }, [chartData, showData]);

  useEffect(() => {
    if (modalOpen && !showData && chartData.categories.length) {
      const cleanup = initializeChart(modalChartRef, modalChartInstance, chartData);
      return cleanup;
    }
  }, [modalOpen, showData, chartData]);

  const downloadCSV = () => {
    if (!chartData.categories.length) return;
    const header = ["Category", "Negative Impact"];
    const rows = chartData.categories
      .map((cat, i) => {
        if (i === 0 || i === chartData.categories.length - 1) return null;
        return [cat, chartData.negativeDriversData[i]];
      })
      .filter(Boolean);
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "top-negative-drivers.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div>Loading Top Negative Drivers data...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;
  if (!chartData.categories.length) return <div>No data available</div>;

  return (
    <>
      <Card
        className="lg:col-span-2 flex flex-col mt-5 w-full h-130 bg-white dark:bg-[#0f172a] rounded-lg shadow-md cursor-pointer hover:ring-2 ring-indigo-500"
        onClick={() => setModalOpen(true)}
        tabIndex={0}
        role="button"
        aria-label="Open Top Negative Drivers details"
      >
        <CardHeader className="flex justify-between px-4 pt-4 pb-1 items-center">
          <div>
            <CardTitle className="text-gray-900 dark:text-gray-100 text-base font-semibold">
              Top Negative Drivers
            </CardTitle>
            <CardDescription className="text-gray-700 dark:text-gray-400">
              Visualization of key drivers contributing to negative sentiment
            </CardDescription>
          </div>
           
        </CardHeader>
        <CardContent className="p-4 flex-1 w-full">
          <div
            ref={inlineChartRef}
            style={{ width: "100%", height: "100%", display: showData ? "none" : "block" }}
          />
          {showData && (
            <div className="max-h-[420px] overflow-auto border border-gray-300 dark:border-gray-700 rounded mt-2">
              <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10 text-gray-900 dark:text-gray-100">
                  <tr>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Negative Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.categories.map((cat, idx) => {
                    if (idx === 0 || idx === chartData.categories.length - 1) return null;
                    return (
                      <tr key={cat} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="px-3 py-2 font-medium">{cat}</td>
                        <td className="px-3 py-2">{chartData.negativeDriversData[idx]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {modalOpen && (
        <DetailsModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setShowData(false);
          }}
          title="Top Negative Drivers"
          description="Visualization of key drivers contributing to negative sentiment"
          onPreview={() => setShowData(v => !v)}
          previewActive={showData}
          onDownload={downloadCSV}
          onShare={shareChart}
        >
          <>
            <div
              ref={modalChartRef}
              style={{ width: "100%", height: 420, display: showData ? "none" : "block" }}
            />
            {showData && (
              <div className="mt-2 max-h-[420px] overflow-auto border border-gray-300 dark:border-gray-700 rounded">
                <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                  <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10 text-gray-900 dark:text-gray-100">
                    <tr>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">Negative Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.categories.map((cat, idx) => {
                      if (idx === 0 || idx === chartData.categories.length - 1) return null;
                      return (
                        <tr key={cat} className="border-b border-gray-200 dark:border-gray-700">
                          <td className="px-3 py-2 font-medium">{cat}</td>
                          <td className="px-3 py-2">{chartData.negativeDriversData[idx]}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        </DetailsModal>
      )}
    </>
  );
};

export default TopNegativeDriversWaterfallChart;
