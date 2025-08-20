import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../Components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../Components/ui/chart';

const COLORS = {
  positive: '#22c55e',
  neutral: '#6b7280',
  negative: '#ef4444',
};

const chartConfig = {
  positive: { label: 'Positive', color: COLORS.positive },
  neutral: { label: 'Neutral', color: COLORS.neutral },
  negative: { label: 'Negative', color: COLORS.negative },
};

const withTotals = (arr) =>
  arr.map((d) => ({
    ...d,
    total: (d.positive || 0) + (d.neutral || 0) + (d.negative || 0),
  }));

const LegendRow = () => {
  const items = [
    { key: 'negative', label: 'Negative', color: COLORS.negative },
    { key: 'neutral', label: 'Neutral', color: COLORS.neutral },
    { key: 'positive', label: 'Positive', color: COLORS.positive },
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

const PlatformBreakdown = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dataset = useMemo(() => withTotals(data), [data]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/api/feedback/getplatformdata`);
        setData(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div>Loading Platform Data...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">Error: {error}</div>;

  return (
    <Card className="flex flex-col bg-white dark:bg-[#0f172a] w-150 h-120 mt-10 rounded-lg shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
          <CardTitle className="text-gray-900 dark:text-gray-100 text-base">Platform Breakdown</CardTitle>
        </div>
        <CardDescription className="text-gray-700 dark:text-gray-400">
          Sentiment distribution across social platforms
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <ChartContainer config={chartConfig} className="w-full pb-2">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={dataset}
              stackOffset="none"
              margin={{ top: 16, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid
                stroke="rgba(0,0,0,0.1)"
                strokeDasharray="4 6"
                vertical={false}
              />
              <XAxis
                dataKey="platform"
                tick={{ fill: 'rgba(31,41,55,0.8)' }}
                axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
                tickLine={false}
                className="dark:!text-gray-300"
              />
              <YAxis
                tick={{ fill: 'rgba(31,41,55,0.8)' }}
                axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
                tickLine={false}
                className="dark:!text-gray-300"
              />

              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, name) => {
                      const label =
                        name === 'positive'
                          ? chartConfig.positive.label
                          : name === 'neutral'
                          ? chartConfig.neutral.label
                          : chartConfig.negative.label;
                      return (
                        <div className="flex w-full justify-between text-gray-900 dark:text-gray-100">
                          <span>{label}</span>
                          <span className="font-mono">{value}</span>
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
                radius={0}
                isAnimationActive={false}
                activeBar={false}
                activeShape={null}
              />
              <Bar
                dataKey="neutral"
                stackId="s"
                fill={COLORS.neutral}
                isAnimationActive={false}
                activeBar={false}
                activeShape={null}
              />
              <Bar
                dataKey="positive"
                stackId="s"
                fill={COLORS.positive}
                radius={0}
                isAnimationActive={false}
                activeBar={false}
                activeShape={null}
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
