"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
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

import DetailsModal from "./DetailsModal";
import { shareChart } from "../lib/Sharechart";
import Loader from "./Loader";

echarts.use([
  TooltipComponent,
  GridComponent,
  VisualMapComponent,
  HeatmapChart,
  CanvasRenderer,
]);

const BASE_URL = import.meta.env.VITE_BASE_URL;

const emotionLabels = ["positive", "neutral", "negative"];
const sourceLabels = ["Facebook", "Twitter", "Instagram", "Reddit", "Other"];

function transformData(rawData) {
  const emotionIndex = { positive: 0, neutral: 1, negative: 2 };
  const sourceIndex = {
    Facebook: 0,
    Twitter: 1,
    Instagram: 2,
    Reddit: 3,
    Other: 4,
  };

  return rawData.map(({ emotion, source, count }) => [
    sourceIndex[source] ?? 4,
    emotionIndex[emotion] ?? 1,
    count,
  ]);
}

const aggregateFilteredData = (filteredData) => {
  const emotionIndex = { positive: 0, neutral: 1, negative: 2 };
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
  const chartRefMain = useRef(null);
  const chartInstanceMain = useRef(null);

  const chartRefModal = useRef(null);
  const chartInstanceModal = useRef(null);

  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [showData, setShowData] = useState(false);

  // Format data as a table-friendly array
  const formattedData = useMemo(() => {
    if (!heatmapData.length) return [];
    return heatmapData.map(([s, e, c]) => ({
      source: sourceLabels[s],
      emotion: emotionLabels[e],
      count: c,
    }));
  }, [heatmapData]);

  // Fetch/Aggregate Data
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
        const res = await axios.get(
          `${BASE_URL}/api/feedback/emotion-source-heatmap`
        );
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

  // Chart option builder
  const getChartOption = () => ({
    tooltip: {
      position: "top",
      formatter: function (params) {
        return `${sourceLabels[params.data[0]]} × ${emotionLabels[params.data[1]]}: ${params.data[2]} mentions`;
      },
    },
    grid: { height: "50%", top: "10%" },
    xAxis: {
      type: "category",
      data: sourceLabels,
      splitArea: { show: true },
      name: "Source",
      nameLocation: "middle",
      nameGap: 30,
    },
    yAxis: {
      type: "category",
      data: emotionLabels,
      splitArea: { show: true },
      name: "Emotion",
      nameLocation: "middle",
      nameGap: 40,
    },
    visualMap: {
      min: 0,
      max: Math.max(...heatmapData.map((d) => d[2]), 1),
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: "5%",
      inRange: {
        color: ["#e0f3f8", "#abd9e9", "#74add1", "#4575b4", "#313695"],
      },
      textStyle: { color: "#ffffff", fontSize: 12 },
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
  });

  // Initialize and dispose main card chart
  useEffect(() => {
    if (!chartRefMain.current || !heatmapData.length || showData) return;

    if (!chartInstanceMain.current) {
      chartInstanceMain.current = echarts.init(chartRefMain.current);
    }
    const chart = chartInstanceMain.current;

    chart.setOption(getChartOption());

    // Resize observer to handle container resizing
    const resizeObserver = new ResizeObserver(() => {
      if (chartRefMain.current) chart.resize();
    });
    resizeObserver.observe(chartRefMain.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
      chartInstanceMain.current = null;
    };
  }, [heatmapData, showData]);

  // Initialize and dispose modal chart
  useEffect(() => {
    if (!modalOpen || showData || !heatmapData.length) return;

    if (!chartRefModal.current) return;

    if (chartInstanceModal.current) {
      chartInstanceModal.current.dispose();
      chartInstanceModal.current = null;
    }

    chartInstanceModal.current = echarts.init(chartRefModal.current);
    const chart = chartInstanceModal.current;

    chart.setOption(getChartOption());

    const resizeObserver = new ResizeObserver(() => {
      if (chartRefModal.current) chart.resize();
    });
    resizeObserver.observe(chartRefModal.current);

    return () => {
      resizeObserver.disconnect();
      if (chartInstanceModal.current) {
        chartInstanceModal.current.dispose();
        chartInstanceModal.current = null;
      }
    };
  }, [modalOpen, heatmapData, showData]);

  // CSV Download
  const downloadCSV = () => {
    if (!formattedData.length) return;
    const header = ["Source", "Emotion", "Count"];
    const rows = formattedData.map((d) => [d.source, d.emotion, d.count]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "emotion-source-heatmap.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div><Loader /></div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;
  if (!heatmapData.length) return <div>No heatmap data available.</div>;

  const renderTable = () => (
    <div className="max-h-[360px] overflow-y-auto border border-gray-300 dark:border-gray-700 rounded">
      <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 sticky top-0 z-10">
          <tr>
            <th className="px-3 py-2">Source</th>
            <th className="px-3 py-2">Emotion</th>
            <th className="px-3 py-2">Count</th>
          </tr>
        </thead>
        <tbody>
          {formattedData.map((row, idx) => (
            <tr key={idx} className="border-b border-gray-200 dark:border-gray-700">
              <td className="px-3 py-2">{row.source}</td>
              <td className="px-3 py-2">{row.emotion}</td>
              <td className="px-3 py-2">{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      {/* Main card (clickable to open modal) */}
      <Card
        className="lg:col-span-2 flex flex-col mt-5 w-full h-[480px] bg-white dark:bg-[#0f172a] rounded-lg shadow-md cursor-pointer hover:ring-2 ring-blue-500"
        onClick={() => setModalOpen(true)}
        role="button"
        tabIndex={0}
        aria-label="Open emotion × source heatmap details"
      >
        <CardHeader className="px-4 pt-4 pb-1">
          <CardTitle className="text-gray-900 dark:text-gray-100 text-base font-semibold">
            Emotion Source Heatmap
          </CardTitle>
          <CardDescription className="text-gray-700 dark:text-gray-400">
            Visualizing emotion distribution across platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-4 w-full" style={{ position: "relative" }}>
          {/* Chart and Table both rendered but toggled with CSS display */}
          <div
            style={{ display: showData ? "none" : "block", width: "100%", height: "100%" }}
            ref={chartRefMain}
          />
          {showData && renderTable()}
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
          title="Emotion Source Heatmap"
          description="This heatmap shows the distribution of emotions across different social media sources."
          onPreview={() => setShowData((v) => !v)}
          onDownload={downloadCSV}
          onShare={shareChart}
          previewActive={showData}
        >
          <div className="h-[420px] w-full" style={{ position: "relative" }}>
            {/* Render both but toggle visibility */}
            <div
              style={{ display: showData ? "none" : "block", width: "100%", height: "100%" }}
              ref={chartRefModal}
            />
            {showData && renderTable()}
          </div>
        </DetailsModal>
      )}
    </>
  );
};

export default EmotionSourceHeatmap;
