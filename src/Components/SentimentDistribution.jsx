"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Pie, PieChart, Cell } from "recharts";
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

export const description = "A pie chart with a label";

const COLORS = {
  positive: "#22c55e", // green
  negative: "#ef4444", // red
  neutral: "#9ca3af", // gray
};

const NEUTRAL_BOOST = 1;
const BASE_URL = import.meta.env.VITE_BASE_URL;

const SentimentDistribution = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchSentimentDistribution() {
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
  }, []);

  const dist = data?.sentiment_distribution ?? {};

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
        (data?.total_mentions ??
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
  }, [data, dist]);

  const toPct = (v) => `${Number(v).toFixed(1)}%`;

  if (loading) return <div>Loading sentiment distribution...</div>;
  if (error)
    return (
      <div className="text-red-500 dark:text-red-400">Error loading data: {error}</div>
    );

  return (
    <div>
      <Card className="lg:col-span-2 flex flex-col mt-5 w-full h-120 bg-white dark:bg-[#0f172a] rounded-lg">
        <CardHeader className="items-center pb-0">
          <CardTitle className="text-gray-900 dark:text-gray-100">Sentiment Distribution</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Breakdown of sentiment across all mentions
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={{ visitors: { label: "Mentions" } }}
            className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square w-[440px] max-w-full mt-0 pb-0"
          >
            <PieChart width={400} height={400}>
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
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="browser"
                label={(entry) => toPct(entry.payload.percent || 0)}
                labelLine
                outerRadius={140}
                cx="50%"
                cy="50%"
                isAnimationActive={false}
              >
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.fill}
                    stroke="#ffffff"
                    strokeWidth={1.2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default SentimentDistribution;
