"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Star,
  MessageCircle,
  ThumbsUp,
  Users,
} from "lucide-react";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const iconMap = {
  netSentiment: <Star className="w-6 h-6 text-green-400" />,
  totalMentions: <MessageCircle className="w-6 h-6 text-blue-400" />,
  positiveSentiment: <ThumbsUp className="w-6 h-6 text-green-400" />,
  engagementRate: <Users className="w-6 h-6 text-purple-400" />,
};

const TopSection = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        // Fetch aggregated stats from your backend API
        const res = await axios.get(`${BASE_URL}/api/feedback/top-stats`);

        const d = res.data;

        setStats([
          {
            title: "Net Sentiment Score",
            value: `${d.netSentiment >= 0 ? "+" : ""}${d.netSentiment.toFixed(1)}`,
            change: `${d.netSentimentChange >= 0 ? "+" : ""}${d.netSentimentChange.toFixed(1)}%`,
            description: "Overall sentiment rating",
            positive: d.netSentimentChange >= 0,
            icon: iconMap.netSentiment,
          },
          {
            title: "Total Mentions",
            value: d.totalMentions.toLocaleString(),
            change: `${d.totalMentionsChange >= 0 ? "+" : ""}${d.totalMentionsChange.toFixed(1)}%`,
            description: "Across all platforms",
            positive: d.totalMentionsChange >= 0,
            icon: iconMap.totalMentions,
          },
          {
            title: "Positive Sentiment",
            value: `${d.positiveSentimentPercent.toFixed(1)}%`,
            change: `${d.positiveSentimentChange >= 0 ? "+" : ""}${d.positiveSentimentChange.toFixed(1)}%`,
            description: "Positive mentions",
            positive: d.positiveSentimentChange >= 0,
            icon: iconMap.positiveSentiment,
          },
          {
            title: "Engagement Rate",
            value: `${d.engagementRate.toFixed(1)}%`,
            change: `${d.engagementRateChange >= 0 ? "+" : ""}${d.engagementRateChange.toFixed(1)}%`,
            description: "User engagement",
            positive: d.engagementRateChange >= 0,
            icon: iconMap.engagementRate,
          },
        ]);
      } catch (err) {
        setError(err.message || "Failed to fetch top stats");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) return <div>Loading stats...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!stats) return null;

  return (
    <div className="w-full rounded-lg p-6 bg-white dark:bg-[#0f172a]">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-100 dark:bg-[#1e293b] rounded-xl p-5 shadow-md flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                {stat.title}
              </h3>
              <div className="cursor-pointer">{stat.icon}</div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-3">{stat.value}</p>

            {/* Range display only under Net Sentiment Score */}
            {stat.title === "Net Sentiment Score" && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Range: -1 to +1</p>
            )}

            <div className="flex items-center gap-2 mt-2">
              {stat.positive ? (
                <ArrowUpRight className="w-4 h-4 text-green-400" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-400" />
              )}
              <span
                className={`text-sm font-medium ${
                  stat.positive ? "text-green-400" : "text-red-400"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
              {stat.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopSection;
