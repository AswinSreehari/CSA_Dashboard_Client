import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Bar,
  BarChart,
  CartesianGrid,
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../Components/ui/chart";

// --- Toggle Switch/Button ---
const Toggle = ({
  checked,
  onChange,
  labelLeft = "Numbers",
  labelRight = "Percentages",
}) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-gray-600 dark:text-gray-300">{labelLeft}</span>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full cursor-pointer bg-gray-300 dark:bg-gray-700 transition-colors
        ${checked ? "bg-indigo-500" : ""}`}
      aria-pressed={checked}
      aria-label="Toggle percentage view"
      type="button"
    >
      <span
        className={`absolute left-0 top-0 w-6 h-6 rounded-full bg-white dark:bg-gray-900 shadow transition-transform
          ${checked ? "translate-x-4" : ""}`}
        style={{ transition: "transform 0.2s" }}
      />
    </button>
    <span className="text-xs text-gray-600 dark:text-gray-300">{labelRight}</span>
  </div>
);

const COLORS = {
  positive: "oklch(58.8% 0.158 241.966)",
  negative: "oklch(74.6% 0.16 232.661)",
  neutral: "oklch(82.8% 0.111 230.318)",
};

const chartConfig = {
  positive: { label: "Positive", color: COLORS.positive },
  neutral: { label: "Neutral", color: COLORS.neutral },
  negative: { label: "Negative", color: COLORS.negative },
};

// Add total count to each data row
const withTotals = (arr) =>
  arr.map((d) => ({
    ...d,
    total: (d.positive || 0) + (d.neutral || 0) + (d.negative || 0),
  }));

// Convert counts to percentages
const toPercentages = (arr) =>
  arr.map((d) => {
    const total = (d.positive || 0) + (d.neutral || 0) + (d.negative || 0);
    return {
      platform: d.platform,
      positive: total ? Math.round(((d.positive || 0) * 1000) / total) / 10 : 0,
      neutral: total ? Math.round(((d.neutral || 0) * 1000) / total) / 10 : 0,
      negative: total ? Math.round(((d.negative || 0) * 1000) / total) / 10 : 0,
      total: 100, // total is always 100 in percentage mode
    };
  });

const LegendRow = () => {
  const items = [
    { key: "negative", label: "Negative", color: COLORS.negative },
    { key: "neutral", label: "Neutral", color: COLORS.neutral },
    { key: "positive", label: "Positive", color: COLORS.positive },
  ];
  return (
    <div className="mt-3 flex items-center justify-center gap-6">
      {items.map((it) => (
        <div key={it.key} className="flex items-center gap-2">
          <span
            className="inline-block rounded-[4px]"
            style={{
              width: 14,
              height: 14,
              backgroundColor: it.color,
            }}
          />
          <span className="text-xs text-gray-600 dark:text-gray-300">{it.label}</span>
        </div>
      ))}
    </div>
  );
};

const BASE_URL = import.meta.env.VITE_BASE_URL;

const PlatformBreakdown = ({ filteredData }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [percentageView, setPercentageView] = useState(false);

  // If filteredData exists and has data, use it; otherwise use locally fetched data
  const dataSource = filteredData && filteredData.length > 0 ? filteredData : data;

  // Transform data for both views
  const rawData = useMemo(() => withTotals(dataSource), [dataSource]);
  const percentData = useMemo(() => toPercentages(dataSource), [dataSource]);
  const dataset = percentageView ? percentData : rawData;

  // Fetch default data only when there is no filtered data
  useEffect(() => {
    if (filteredData && filteredData.length > 0) {
      // Skip fetching when filtered data is present
      return;
    }
    async function loadData() {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/api/feedback/getplatformdata`);
        setData(response.data);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [filteredData]);

  if (loading) return <div>Loading Platform Data...</div>;
  if (error)
    return (
      <div className="text-red-600 dark:text-red-400">Error: {error}</div>
    );

  return (
    <Card className="flex flex-col bg-white dark:bg-[#0f172a] w-150 h-120 mt-10 rounded-lg shadow-md">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        {/* Left (Title/Description) */}
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
            <CardTitle className="text-gray-900 dark:text-gray-100 text-base">
              Platform Breakdown
            </CardTitle>
          </div>
          <CardDescription className="text-gray-700 dark:text-gray-400">
            Sentiment distribution across social platforms
          </CardDescription>
        </div>
        {/* Right (Toggle) */}
        <Toggle checked={percentageView} onChange={setPercentageView} />
      </CardHeader>

      <CardContent className="pt-2">
        <ChartContainer config={chartConfig} className="w-full pb-2">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={dataset}
              stackOffset="none"
              margin={{ top: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                stroke="rgba(0,0,0,0.1)"
                strokeDasharray="4 6"
                vertical={false}
              />
              <XAxis
                dataKey="platform"
                tick={{ fill: "rgba(31,41,55,0.8)" }}
                axisLine={{ stroke: "rgba(0,0,0,0.1)" }}
                tickLine={false}
                className="dark:!text-gray-300"
              />
              <YAxis
                domain={percentageView ? [0, 100] : [0, "auto"]}
                tick={{ fill: "rgba(31,41,55,0.8)" }}
                axisLine={{ stroke: "rgba(0,0,0,0.1)" }}
                tickLine={false}
                className="dark:!text-gray-300"
                ticks={percentageView ? [0, 20, 40, 60, 80, 100] : undefined}
                unit={percentageView ? "%" : undefined}
                tickFormatter={percentageView ? (val) => `${val}` : undefined}
                label={{
                  value: percentageView ? "Sentiment (%)" : "Sentiment (Count)",
                  angle: -90,
                  position: "insideLeft",
                  dx: -8,
                  style: { textAnchor: "middle", fill: "#64748b", fontSize: "1rem" },
                }}
              />

              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, name) => {
                      const label =
                        name === "positive"
                          ? chartConfig.positive.label
                          : name === "neutral"
                          ? chartConfig.neutral.label
                          : chartConfig.negative.label;
                      return (
                        <div className="flex w-full justify-between text-gray-900 dark:text-gray-100">
                          <span>{label}</span>
                          <span className="font-mono">
                            {percentageView ? `${value}%` : value}
                          </span>
                        </div>
                      );
                    }}
                  />
                }
              />

              <Bar
                dataKey="negative"
                stackId="s"
                fill={COLORS.negative}
                radius={[0, 0, 4, 4]}
                isAnimationActive={true}
                activeBar={false}
                activeShape={null}
                barSize={60}
              />
              <Bar
                dataKey="neutral"
                stackId="s"
                fill={COLORS.neutral}
                isAnimationActive={true}
                activeBar={false}
                activeShape={null}
                barSize={60}
              />
              <Bar
                dataKey="positive"
                stackId="s"
                fill={COLORS.positive}
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                activeBar={false}
                activeShape={null}
                barSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <LegendRow />
      </CardContent>
    </Card>
  );
};

export default PlatformBreakdown;
