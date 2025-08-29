"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { Pie, PieChart, Cell, Sector, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../Components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../Components/ui/chart";
import axios from "axios";
import DetailsModal from "./DetailsModal";
import { shareChart } from "../lib/Sharechart";
import Loader from "./Loader";



export const description = "A donut chart with a label and platform breakdown per sentiment on hover";

const COLORS = {
  positive: "oklch(58.8% 0.158 241.966)",  // greenish
  negative: "oklch(74.6% 0.16 232.661)",   // orangish
  neutral: "oklch(82.8% 0.111 230.318)",   // yellowish
};
const PLATFORM_COLORS = [
  "#6366F1",
  "#0EA5E9",
  "#22D3EE",
  "#A3E635",
  "#FBBF24",
  "#F472B6",
  "#A78BFA",
  "#E879F9",
  "#FB7185",
  "#FCD34D",
  "#10B981",
];

const LEGEND_ITEMS = [
  { key: "positive", label: "Positive", color: COLORS.positive },
  { key: "negative", label: "Negative", color: COLORS.negative },
  { key: "neutral", label: "Neutral", color: COLORS.neutral }
];

const NEUTRAL_BOOST = 1;
const BASE_URL = import.meta.env.VITE_BASE_URL;

const renderActiveShape = (props) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill,
  } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

const SentimentDistribution = ({ filteredData }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showData, setShowData] = useState(false);
  const chartRef = useRef(null);

  // Fetch default data only if no filteredData is provided
  useEffect(() => {
    async function fetchSentimentDistribution() {
      if (filteredData && filteredData.length > 0) {
        // If filteredData is present, skip fetching default
        setData(null);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${BASE_URL}/api/feedback/sentiment-distribution`);
        setData(res.data);
      } catch (err) {
        setError(err.message || "Failed to fetch sentiment distribution");
      } finally {
        setLoading(false);
      }
    }
    fetchSentimentDistribution();
  }, [filteredData]);



  // Using either filteredData or fetched default data for processing
  const dist = filteredData
    ? {
      positive: filteredData.filter((d) => d.sentiment?.label === "positive").length,
      negative: filteredData.filter((d) => d.sentiment?.label === "negative").length,
      neutral: filteredData.filter((d) => d.sentiment?.label === "neutral").length,
      percentages: null, // no percentages in filtered raw data
    }
    : data?.sentiment_distribution ?? {};

  const platformBreakdown = filteredData
    ? {} // you can enhance this later to compute platformBreakdown from filteredData if needed
    : data?.platform_breakdown ?? {};

  const downloadCSV = () => {
  if (!data) return;
  const header = ["Sentiment", "Count", "Percentage"];
  const rows = [
    [
      "Positive",
      data.sentiment_distribution?.positive || 0,
      data.sentiment_distribution?.percentages?.positive?.toFixed(2) || "0.00",
    ],
    [
      "Neutral",
      data.sentiment_distribution?.neutral || 0,
      data.sentiment_distribution?.percentages?.neutral?.toFixed(2) || "0.00",
    ],
    [
      "Negative",
      data.sentiment_distribution?.negative || 0,
      data.sentiment_distribution?.percentages?.negative?.toFixed(2) || "0.00",
    ],
  ];
  const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.href = encodedUri;
  link.download = "sentiment-distribution.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};



  const { chartData, usePercentages } = useMemo(() => {
    const hasPct =
      dist?.percentages &&
      typeof dist.percentages === "object" &&
      ["positive", "neutral", "negative"].every(
        (k) => typeof dist.percentages[k] === "number"
      );

    let positiveVal, negativeVal, neutralVal;
    let positivePct, negativePct, neutralPct;

    if (hasPct) {
      positivePct = dist.percentages.positive || 0;
      negativePct = dist.percentages.negative || 0;
      neutralPct = dist.percentages.neutral || 0;

      neutralVal = neutralPct * NEUTRAL_BOOST;
      positiveVal = positivePct;
      negativeVal = negativePct;

      if (NEUTRAL_BOOST !== 1) {
        const sumBoosted = positiveVal + negativeVal + neutralVal;
        positiveVal = (positiveVal / sumBoosted) * 100;
        negativeVal = (negativeVal / sumBoosted) * 100;
        neutralVal = (neutralVal / sumBoosted) * 100;
      } else {
        positiveVal = positivePct;
        negativeVal = negativePct;
        neutralVal = neutralPct;
      }
    } else {
      const total =
        (filteredData
          ? filteredData.length
          : data?.total_mentions ??
          (dist.positive || 0) + (dist.neutral || 0) + (dist.negative || 0)) || 1;

      positivePct = ((dist.positive || 0) / total) * 100;
      negativePct = ((dist.negative || 0) / total) * 100;
      neutralPct = ((dist.neutral || 0) / total) * 100;

      positiveVal = dist.positive || 0;
      negativeVal = dist.negative || 0;
      neutralVal = (dist.neutral || 0) * NEUTRAL_BOOST;
    }

    const rows = [
      {
        browser: "Positive",
        key: "positive",
        value: positiveVal,
        percent: positivePct,
        fill: COLORS.positive,
      },
      {
        browser: "Negative",
        key: "negative",
        value: negativeVal,
        percent: negativePct,
        fill: COLORS.negative,
      },
      {
        browser: "Neutral",
        key: "neutral",
        value: neutralVal,
        percent: neutralPct,
        fill: COLORS.neutral,
      },
    ];

    return { chartData: rows, usePercentages: hasPct };
  }, [data, dist, filteredData]);

  const toPct = (v) => `${Number(v).toFixed(1)}%`;

  const totalValue = filteredData
    ? filteredData.length
    : data?.total_mentions ??
    (dist.positive || 0) + (dist.neutral || 0) + (dist.negative || 0);

  const hoveredSentiment = chartData[activeIndex]?.key;
  const innerPlatforms = platformBreakdown?.[hoveredSentiment] || [];

  if (loading) return <div><Loader /></div>;
  if (error)
    return (
      <div className="text-red-500 dark:text-red-400">
        Error loading data: {error}
      </div>
    );


  const renderChart = () => {
    return (
      <ChartContainer
        config={{ visitors: { label: "Mentions" } }}
        className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square h-90 w-[440px] max-w-full mt-0 pb-0"
      >
        <ResponsiveContainer width="100%" height={400}>
          <PieChart width={400} height={400}>
            {/* Centered label */}
            <text
              x="50%"
              y="45%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-bold text-neutral-700 dark:text-neutral-200"
              fontSize="24"
              fill="currentColor"
              style={{
                fontWeight: 700,
                pointerEvents: "none",
              }}
            >
              Total
            </text>
            <text
              x="50%"
              y="55%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-bold  text-neutral-700 dark:text-neutral-200"
              fontSize="33"
              fill="currentColor"
              style={{
                fontWeight: 700,
                pointerEvents: "none",
              }}
            >
              {totalValue}
            </text>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name, item) => {
                    const p = item?.payload?.percent ?? 0;
                    return (
                      <div className="flex w-full justify-between text-gray-900 dark:text-gray-100">
                        <span>{name}</span>
                        <span className="font-mono">{toPct(p)}</span>
                      </div>
                    );
                  }}
                />
              }
            />

            {/* OUTER sentiment ring */}
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="browser"
              label={(entry) => toPct(entry.payload.percent || 0)}
              labelLine
              cx="50%"
              cy="50%"
              outerRadius={140}
              innerRadius={90}
              isAnimationActive={false}
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={(_, i) => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {chartData?.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.fill}
                  stroke="#fff"
                  strokeWidth={4}
                  className="dark:stroke-[#1a1a1a]"
                />
              ))}
            </Pie>

            {/* INNER platform breakdown for hovered sentiment */}
            {activeIndex !== null && innerPlatforms.length > 0 && (
              <Pie
                data={innerPlatforms}
                dataKey="count"
                nameKey="platform"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={83}
                isAnimationActive={false}
                label={({ platform, percent }) =>
                  `${platform}: ${(percent * 100).toFixed(1)}%`
                }
              >
                {innerPlatforms?.map((p, idx) => (
                  <Cell
                    key={idx}
                    fill={PLATFORM_COLORS[idx % PLATFORM_COLORS.length]}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            )}
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    )
  }


  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        tabIndex={0}
        role="button"
        aria-label="Open chart details"
        className="cursor-pointer hover:ring-2 ring-blue-500 rounded-lg"
      >
        <Card className="lg:col-span-2 flex flex-col mt-5 w-full h-130 
        bg-white dark:bg-[#0f172a] rounded-lg relative overflow-visible
        border border-gray-100 dark:border-slate-700">
          {/* Legend in top-right */}
          <div
            style={{
              position: "absolute",
              top: 22,
              right: 26,
              display: "flex",
              gap: "12px",
              zIndex: 10,
            }}
          >
            {LEGEND_ITEMS?.map((item) => (
              <div
                key={item.key}
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "16px",
                    height: "16px",
                    borderRadius: "3px",
                    background: item.color,
                    border: "1.5px solid #e2e8f0",
                  }}
                />
                <span
                  className="text-xs text-gray-700 dark:text-gray-300 select-none"
                  style={{ userSelect: "none" }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <CardHeader className="items-center pb-0">
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Sentiment Distribution
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Breakdown of sentiment across all platforms
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 pb-0">
            {showData ? (
              <div className="max-h-[350px] overflow-y-auto border border-gray-300 dark:border-gray-700 rounded p-4">
                <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                  <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="p-2">Sentiment</th>
                      <th className="p-2">Count</th>
                      <th className="p-2">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="p-2 font-semibold">Positive</td>
                      <td className="p-2">{data?.sentiment_distribution?.positive ?? "-"}</td>
                      <td className="p-2">{data?.sentiment_distribution?.percentages?.positive?.toFixed(2) ?? "-"}%</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="p-2 font-semibold">Neutral</td>
                      <td className="p-2">{data?.sentiment_distribution?.neutral ?? "-"}</td>
                      <td className="p-2">{data?.sentiment_distribution?.percentages?.neutral?.toFixed(2) ?? "-"}%</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="p-2 font-semibold">Negative</td>
                      <td className="p-2">{data?.sentiment_distribution?.negative ?? "-"}</td>
                      <td className="p-2">{data?.sentiment_distribution?.percentages?.negative?.toFixed(2) ?? "-"}%</td>
                    </tr>
                    <tr className="font-bold">
                      <td className="p-2">Total</td>
                      <td className="p-2">{data?.total_mentions ?? "-"}</td>
                      <td className="p-2">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              renderChart()
            )}

          </CardContent>
        </Card>

      </div>

      {modalOpen && (
        <DetailsModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Sentiment Distrubution"
          description="Breakdown of sentiment across all platforms"
          onPreview={() => setShowData((v) => !v)}
          onDownload={downloadCSV}
          onShare={shareChart}
          previewActive={showData}
          LEGEND_ITEMS={LEGEND_ITEMS}
        >
          {showData ? (
            <div className="max-h-[350px] overflow-y-auto border border-gray-300 dark:border-gray-700 rounded p-4">
              <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="p-2">Sentiment</th>
                    <th className="p-2">Count</th>
                    <th className="p-2">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="p-2 font-semibold">Positive</td>
                    <td className="p-2">{data?.sentiment_distribution?.positive ?? "-"}</td>
                    <td className="p-2">{data?.sentiment_distribution?.percentages?.positive?.toFixed(2) ?? "-"}%</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="p-2 font-semibold">Neutral</td>
                    <td className="p-2">{data?.sentiment_distribution?.neutral ?? "-"}</td>
                    <td className="p-2">{data?.sentiment_distribution?.percentages?.neutral?.toFixed(2) ?? "-"}%</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="p-2 font-semibold">Negative</td>
                    <td className="p-2">{data?.sentiment_distribution?.negative ?? "-"}</td>
                    <td className="p-2">{data?.sentiment_distribution?.percentages?.negative?.toFixed(2) ?? "-"}%</td>
                  </tr>
                  <tr className="font-bold">
                    <td className="p-2">Total</td>
                    <td className="p-2">{data?.total_mentions ?? "-"}</td>
                    <td className="p-2">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="max-h-[49vh] no-scrollbar pr-1">
            {renderChart()}
            </div>
          )}
        </DetailsModal>
      )}
    </>
  );
};

export default SentimentDistribution;
