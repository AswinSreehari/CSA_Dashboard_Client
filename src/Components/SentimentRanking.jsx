"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../Components/ui/card";
import { Progress } from "../Components/ui/progress";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const SentimentRanking = () => {
  const [data, setData] = useState({ rankings: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRanking() {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${BASE_URL}/api/feedback/sentiment-ranking`);
        setData(response.data);
      } catch (err) {
        setError(err.message || "Failed to fetch ranking data");
      } finally {
        setLoading(false);
      }
    }
    fetchRanking();
  }, []);

  if (loading) return <div>Loading sentiment rankings...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">Error: {error}</div>;

  return (
    <Card className="text-gray-900 dark:text-white bg-white dark:bg-[#0f172a] shadow-md rounded-xl p-4 w-180 my-10">
      <CardContent>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          Sentiment Rankings
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
          How Google Pixel compares to major competitors
        </p>

        <div className="space-y-4">
          {data.rankings.map((item) => (
            <div
              key={item.rank}
              className={`p-3 rounded-lg flex items-center justify-between ${
                item.is_your_brand ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-[#1e293b]"
              }`}
            >
              {/* Left section */}
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">#{item.rank}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.brand}</span>
                  {item.is_your_brand && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                      Your Brand
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {item.mentions.toLocaleString()} mentions • {item.market_share} market share
                </p>
              </div>

              {/* Right section */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex space-x-2 text-xs mr-1">
                  <span className="text-green-400 leading-none">↑ {item.delta_positive}</span>
                  <span className="text-red-400 leading-none">↓ {item.delta_negative}</span>
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
    </Card>
  );
};

export default SentimentRanking;
