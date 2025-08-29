"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "../Components/ui/card";
import { Progress } from "../Components/ui/progress";
import axios from "axios";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import DetailsModal from "./DetailsModal";
import { shareChart } from "../lib/Sharechart";
import Loader from "./Loader";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const ROWS_PER_PAGE = 4;

const SentimentRanking = ({ filteredData }) => {
  const [data, setData] = useState({ rankings: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [showData, setShowData] = useState(false);

  const chartRef = useRef(null);

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

  // CSV download for full rankings
  const downloadCSV = () => {
    if (!data.rankings.length) return;
    const header = [
      "Rank",
      "Brand",
      "Mentions",
      "Sentiment Percent",
      "Delta Positive",
      "Delta Negative",
      "Market Share",
      "Is Your Brand",
    ];
    const rows = data.rankings.map((item) => [
      item.rank,
      item.brand,
      item.mentions,
      item.sentiment_percent,
      item.delta_positive,
      item.delta_negative,
      item.market_share,
      item.is_your_brand ? "Yes" : "No",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "sentiment-rankings.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div><Loader /></div>;
  if (error)
    return <div className="text-red-600 dark:text-red-400">Error: {error}</div>;

  return (
    <>
      {/* Main card clickable to open modal */}
      <Card
        className="text-gray-900 dark:text-white bg-white dark:bg-[#0f172a] shadow-md rounded-xl p-4 w-180 my-5 h-130 flex flex-col cursor-pointer hover:ring-2 ring-blue-500"
        onClick={() => setModalOpen(true)}
        ref={chartRef}
        tabIndex={0}
        role="button"
        aria-label="Open sentiment rankings details"
      >
        <CardContent className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-m font-bold  text-gray-900 dark:text-gray-300 flex items-center">
               Sentiment Rankings
            </h2>
             
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-6">
            How Google Pixel compares to major competitors
          </p>

          {showData ? (
            <div className="max-h-[300px] no-scrollbar border border-gray-300 dark:border-gray-700 rounded">
              <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2">Rank</th>
                    <th className="px-3 py-2">Brand</th>
                    <th className="px-3 py-2">Mentions</th>
                    <th className="px-3 py-2">Sentiment %</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedRankings.map((item) => (
                    <tr
                      key={item.rank}
                      className={`border-b border-gray-200 dark:border-gray-700 ${
                        item.is_your_brand
                          ? "bg-blue-100 dark:bg-blue-900"
                          : "bg-gray-100 dark:bg-[#1e293b]"
                      }`}
                    >
                      <td className="px-3 py-2 font-bold">{item.rank}</td>
                      <td className="px-3 py-2">{item.brand}</td>
                      <td className="px-3 py-2">
                        {item.mentions.toLocaleString()}
                      </td>
                      <td className="px-3 py-2">{item.sentiment_percent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-4 max-h-[300px] no-scrollbar">
              {pagedRankings.map((item) => (
                <div
                  key={item.rank}
                  className={`p-3 rounded-lg flex items-center justify-between ${
                    item.is_your_brand
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "bg-gray-100 dark:bg-[#1e293b]"
                  }`}
                >
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
                      {item.mentions.toLocaleString()} mentions •{" "}
                      {item.market_share} market share
                    </p>
                  </div>
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
          )}
        </CardContent>

        {/* Pagination controls */}
        <div className="flex justify-center gap-4 mt-4 px-2">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className={`px-3 py-1 rounded-md border ${
              page === 1
                ? "border-gray-300 text-gray-400 cursor-not-allowed"
                : "border-sky-900 text-sky-900 hover:bg-indigo-50 cursor-pointer"
            }`}
          >
            <FaArrowLeft />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages || 1}
          </span>
          <button
            onClick={handleNext}
            disabled={page === totalPages || totalPages === 0}
            className={`px-3 py-1 rounded-md border ${
              page === totalPages
                ? "border-gray-300 text-gray-400 cursor-not-allowed"
                : "border-sky-900 text-sky-900 cursor-pointer hover:bg-indigo-50"
            }`}
          >
            <FaArrowRight />
          </button>
        </div>
      </Card>

      {/* Details Modal */}
      {modalOpen && (
        <DetailsModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setShowData(false); // reset preview on modal close
            setPage(1); // reset page in modal close
          }}
          title="Sentiment Rankings"
          description="How Google Pixel compares to major competitors."
          onPreview={() => setShowData((v) => !v)}
          previewActive={showData}
          onDownload={downloadCSV}
          onShare={shareChart}
        >
          {showData ? (
            <div className="max-h-[400px] no-scrollbar border border-gray-300 dark:border-gray-700 rounded">
              <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2">Rank</th>
                    <th className="px-3 py-2">Brand</th>
                    <th className="px-3 py-2">Mentions</th>
                    <th className="px-3 py-2">Sentiment %</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rankings.map((item) => (
                    <tr
                      key={item.rank}
                      className={`border-b border-gray-200 dark:border-gray-700 ${
                        item.is_your_brand
                          ? "bg-blue-100 dark:bg-blue-900"
                          : "bg-gray-100 dark:bg-[#1e293b]"
                      }`}
                    >
                      <td className="px-3 py-2 font-bold">{item.rank}</td>
                      <td className="px-3 py-2">{item.brand}</td>
                      <td className="px-3 py-2">{item.mentions.toLocaleString()}</td>
                      <td className="px-3 py-2">{item.sentiment_percent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] no-scrollbar">
              {data.rankings.map((item) => (
                <div
                  key={item.rank}
                  className={`p-3 rounded-lg flex items-center justify-between ${
                    item.is_your_brand
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "bg-gray-100 dark:bg-[#1e293b]"
                  }`}
                >
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
                      {item.mentions.toLocaleString()} mentions •{" "}
                      {item.market_share} market share
                    </p>
                  </div>
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
          )}
        </DetailsModal>
      )}
    </>
  );
};

export default SentimentRanking;
