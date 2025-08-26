"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../Components/ui/card";
import { Progress } from "../Components/ui/progress";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const ROWS_PER_PAGE = 4;

const SentimentRanking = ({ filteredData }) => {
  const [data, setData] = useState({ rankings: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  // Aggregate filteredData into rankings format using `model` as brand name
  const aggregateFilteredData = (rawData) => {
    const brandMap = {};

    rawData.forEach(({ model = "Unknown", sentiment }) => {
      if (!brandMap[model]) {
        brandMap[model] = {
          brand: model,
          mentions: 0,
          positiveCount: 0,
          negativeCount: 0,
        };
      }
      brandMap[model].mentions += 1;
      if (sentiment?.label === "positive") {
        brandMap[model].positiveCount += 1;
      }
      if (sentiment?.label === "negative") {
        brandMap[model].negativeCount += 1;
      }
    });

    const rankingsArray = Object.values(brandMap)
      .map((b) => {
        const sentimentPercent = b.mentions
          ? Math.round((b.positiveCount / b.mentions) * 100)
          : 0;
        return {
          brand: b.brand,
          mentions: b.mentions,
          sentiment_percent: sentimentPercent,
          delta_positive: 0,
          delta_negative: 0,
          market_share: "N/A",
          is_your_brand: false,
        };
      })
      .sort((a, b) => b.sentiment_percent - a.sentiment_percent)
      .map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));

    return { rankings: rankingsArray };
  };

  // Use filteredData rankings if available; else fetch default data
  useEffect(() => {
    async function fetchRanking() {
      if (filteredData && filteredData.length > 0) {
        setData(aggregateFilteredData(filteredData));
        setPage(1); // reset page on filtered data change
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${BASE_URL}/api/feedback/sentiment-ranking`
        );
        setData(response.data);
        setPage(1);
      } catch (err) {
        setError(err.message || "Failed to fetch ranking data");
      } finally {
        setLoading(false);
      }
    }
    fetchRanking();
  }, [filteredData]);

  // Pagination slice
  const totalPages = Math.ceil(data.rankings.length / ROWS_PER_PAGE);
  const pagedRankings = data.rankings.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE
  );

  const handlePrev = () => {
    setPage((p) => Math.max(p - 1, 1));
  };

  const handleNext = () => {
    setPage((p) => Math.min(p + 1, totalPages));
  };

  if (loading) return <div>Loading sentiment rankings...</div>;
  if (error)
    return (
      <div className="text-red-600 dark:text-red-400">Error: {error}</div>
    );

  return (
    <Card className="text-gray-900 dark:text-white bg-white dark:bg-[#0f172a] shadow-md rounded-xl p-4 w-180 my-10 h-128 flex flex-col">
      <CardContent className="flex-1">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center mb-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          Sentiment Rankings
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-6">
          How Google Pixel compares to major competitors
        </p>

        <div className="space-y-4">
          {pagedRankings.map((item) => (
            <div
              key={item.rank}
              className={`p-3 rounded-lg flex items-center justify-between ${
                item.is_your_brand
                  ? "bg-blue-100 dark:bg-blue-900"
                  : "bg-gray-100 dark:bg-[#1e293b]"
              }`}
            >
              {/* Left section */}
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    #{item.rank}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.brand}
                  </span>
                  {item.is_your_brand && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                      Your Brand
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {item.mentions.toLocaleString()} mentions • {item.market_share}{" "}
                  market share
                </p>
              </div>

              {/* Right section */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex space-x-2 text-xs mr-1">
                  <span className="text-green-400 leading-none">
                    ↑ {item.delta_positive}
                  </span>
                  <span className="text-red-400 leading-none">
                    ↓ {item.delta_negative}
                  </span>
                </div>
                <span className="text-lg font-bold leading-none whitespace-nowrap text-gray-900 dark:text-gray-100">
                  {item.sentiment_percent}
                </span>
                <Progress
                  value={parseFloat(item.sentiment_percent)}
                  className="w-32 h-2 bg-gray-300 dark:bg-gray-700"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      {/* Pagination controls */}
      <div className="flex justify-between mt-4 px-2">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Page {page} of {totalPages || 1}
        </span>
        <button
          onClick={handleNext}
          disabled={page === totalPages || totalPages === 0}
          className="px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </Card>
  );
};

export default SentimentRanking;
