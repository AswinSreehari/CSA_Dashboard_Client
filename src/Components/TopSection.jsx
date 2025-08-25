"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Star,
  MessageCircle,
  ThumbsUp,
  Users,
  X,
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
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalKey, setModalKey] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${BASE_URL}/api/feedback/top-stats`);
        setRawData(res.data);
        setStats([
          {
            key: "netSentiment",
            title: "Net Sentiment Score",
            value: `${res.data.netSentiment >= 0 ? "+" : ""}${res.data.netSentiment.toFixed(1)}`,
            change: `${res.data.netSentimentChange >= 0 ? "+" : ""}${res.data.netSentimentChange.toFixed(1)}%`,
            description: "Overall sentiment rating",
            positive: res.data.netSentimentChange >= 0,
            icon: iconMap.netSentiment,
          },
          {
            key: "totalMentions",
            title: "Total Mentions",
            value: res.data.totalMentions.toLocaleString(),
            change: `${res.data.totalMentionsChange >= 0 ? "+" : ""}${res.data.totalMentionsChange.toFixed(1)}%`,
            description: "Across all platforms",
            positive: res.data.totalMentionsChange >= 0,
            icon: iconMap.totalMentions,
          },
          {
            key: "positiveSentiment",
            title: "Positive Sentiment",
            value: `${res.data.positiveSentimentPercent.toFixed(1)}%`,
            change: `${res.data.positiveSentimentChange >= 0 ? "+" : ""}${res.data.positiveSentimentChange.toFixed(1)}%`,
            description: "Positive mentions",
            positive: res.data.positiveSentimentChange >= 0,
            icon: iconMap.positiveSentiment,
          },
          {
            key: "engagementRate",
            title: "Engagement Rate",
            value: `${res.data.engagementRate.toFixed(1)}%`,
            change: `${res.data.engagementRateChange >= 0 ? "+" : ""}${res.data.engagementRateChange.toFixed(1)}%`,
            description: "User engagement",
            positive: res.data.engagementRateChange >= 0,
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

  // Calculate positiveMentionsCount here for modal use
  const positiveMentionsCount =
    rawData?.totalMentions && rawData?.positiveSentimentPercent
      ? Math.round((rawData.positiveSentimentPercent / 100) * rawData.totalMentions)
      : null;

  const handleStatClick = (stat) => setModalKey(stat.key);
  const closeModal = () => setModalKey(null);

  const renderModalContent = () => {
    if (!rawData || !modalKey) return null;
    switch (modalKey) {
      case "netSentiment":
        return (
          <>
            <div className="flex items-center gap-3 mb-4 ">
              {iconMap.netSentiment}
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Net Sentiment Details</h2>
            </div>
            <p className="text-base text-gray-700 dark:text-gray-300">
              <strong>Net Sentiment Score:</strong> {rawData.netSentiment.toFixed(2)}{" "}
              <br />
              <small>(Range: -1 = all negative, +1 = all positive)</small>
            </p>
            <ul className="mt-4 text-gray-700 dark:text-gray-300 text-sm">
              <li>
                <span className="text-green-500 font-semibold">Positive Mentions:</span>{" "}
                {positiveMentionsCount !== null ? positiveMentionsCount.toLocaleString() : "-"}
              </li>
              <li>
                <span className="text-yellow-500 font-semibold">Neutral Mentions:</span>{" "}
                {rawData.neutralMentions?.toLocaleString() ?? "-"}
              </li>
              <li>
                <span className="text-red-500 font-semibold">Negative Mentions:</span>{" "}
                {rawData.negativeMentions?.toLocaleString() ?? "-"}
              </li>
            </ul>
          </>
        );
      case "totalMentions":
        return (
          <>
            <div className="flex items-center gap-3 mb-4">
              {iconMap.totalMentions}
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Total Mentions</h2>
            </div>
            <p className="text-base text-gray-700 dark:text-gray-300">
              <strong>Total:</strong> {rawData.totalMentions?.toLocaleString() ?? "-"}
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
              Mentions have changed by {rawData.totalMentionsChange >= 0 ? "+" : ""}
              {rawData.totalMentionsChange?.toFixed(1) ?? "-"}% compared to previous period.
            </p>
          </>
        );
      case "positiveSentiment":
        return (
          <>
            <div className="flex items-center gap-3 mb-4">
              {iconMap.positiveSentiment}
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Positive Sentiment Details</h2>
            </div>
            <p className="text-base text-gray-700 dark:text-gray-300 mb-2">
              <strong>Positive Mentions:</strong> {positiveMentionsCount !== null ? positiveMentionsCount.toLocaleString() : "-"}
              <br />
              <strong>Neutral Mentions:</strong> {rawData.neutralMentions?.toLocaleString() ?? "-"}
              <br />
              <strong>Negative Mentions:</strong> {rawData.negativeMentions?.toLocaleString() ?? "-"}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Percent positive: {rawData.positiveSentimentPercent?.toFixed(1) ?? "-"}%
              <br />
              Change: {rawData.positiveSentimentChange >= 0 ? "+" : ""}
              {rawData.positiveSentimentChange?.toFixed(1) ?? "-"}%
            </p>
          </>
        );
      case "engagementRate":
        return (
          <>
            <div className="flex items-center gap-3 mb-4">
              {iconMap.engagementRate}
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Engagement Rate Details</h2>
            </div>
            <p className="text-base text-gray-700 dark:text-gray-300">
              <strong>Engagement Rate:</strong> {rawData.engagementRate?.toFixed(1) ?? "-"}%
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
              Change: {rawData.engagementRateChange >= 0 ? "+" : ""}
              {rawData.engagementRateChange?.toFixed(1) ?? "-"}%
            </p>
          </>
        );
      default:
        return null;
    }
  };

  if (loading) return <div>Loading stats...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!stats) return null;

  return (
    <div className="w-full rounded-lg p-6 bg-white dark:bg-[#0f172a] ">
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 cursor-pointer">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-100 dark:bg-[#1e293b] rounded-xl p-5 shadow-md flex flex-col justify-between"
          type="button"
            onClick={() => handleStatClick(stat)}
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

      {modalKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-xl p-7 relative max-w-md w-full">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
            >
              <X className="w-6 h-6 cursor-pointer" />
            </button>
            {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopSection;
