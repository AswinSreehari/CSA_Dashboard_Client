"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";

import {
  Camera,
  Battery,
  Package,
  BatteryCharging,
  DollarSignIcon,
  LogsIcon,
} from "lucide-react";

import DetailsModal from "./DetailsModal";
import { shareChart } from "../lib/Sharechart";

// oklch color constants
const GREEN_COLOR = "oklch(58.8% 0.158 241.966)";
const RED_COLOR = "oklch(82.8% 0.111 230.318)";

const iconMap = {
  Camera,
  Battery,
  Package,
  BatteryCharging,
  DollarSignIcon,
  LogsIcon,
};

const categoryToIconKey = {
  Camera: "Camera",
  Battery: "Battery",
  Package: "Package",
  Charging: "BatteryCharging",
  Pricing: "DollarSignIcon",
  Logs: "LogsIcon",
};

const BASE_URL = import.meta.env.VITE_BASE_URL;

const TopKeywords = ({ filteredData, sidebarOpen }) => {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 4;

  // Modal/preview state
  const [modalOpen, setModalOpen] = useState(false);
  const [showData, setShowData] = useState(false);

  const chartRef = useRef(null);

  const mapDataToKeywords = (dataArray) => {
    const categoryMap = {};
    dataArray.forEach((item) => {
      const category = item.category || "Unknown";
      if (!categoryMap[category]) {
        categoryMap[category] = {
          mentions: 0,
          positiveCount: 0,
        };
      }
      categoryMap[category].mentions += 1;
      if (item.sentiment?.label === "positive") {
        categoryMap[category].positiveCount += 1;
      }
    });

    return Object.entries(categoryMap).map(([category, stats]) => {
      const positivePercentage = stats.mentions
        ? Math.round((stats.positiveCount / stats.mentions) * 100)
        : 0;
      const iconKey = categoryToIconKey[category] || "LogsIcon";
      return {
        title: category,
        mentions: stats.mentions,
        percentage: `${positivePercentage}%`,
        icon: iconKey,
        color: positivePercentage >= 50 ? "green" : "red",
      };
    });
  };

  useEffect(() => {
    async function fetchDefaultSentimentSummary() {
      try {
        setLoading(true);
        setError(null);
        if (!filteredData || filteredData.length === 0) {
          const res = await axios.get(`${BASE_URL}/api/feedback/sentiment-summary`);
          const mapped = res.data.map((item) => {
            const title = item.category || "Unknown";
            const iconKey = categoryToIconKey[title] || "LogsIcon";
            return {
              title,
              mentions: item.mentions,
              percentage: item.positivePercentage || "0%",
              icon: iconKey,
              color: parseInt(item.positivePercentage) >= 50 ? "green" : "red",
            };
          });
          setKeywords(mapped);
        } else {
          const mapped = mapDataToKeywords(filteredData);
          setKeywords(mapped);
        }
        setCurrentPage(1);
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchDefaultSentimentSummary();
  }, [filteredData]);

  // CSV Export
  const downloadCSV = () => {
    if (!keywords.length) return;
    const header = ["Category", "Mentions", "Positive %"];
    const rows = keywords.map((k) => [k.title, k.mentions, k.percentage]);
    const csvContent =
      "data:text/csv;charset=utf-8," + [header, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "top-keywords.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div>Loading keywords...</div>;
  if (error) return <div style={{ color: RED_COLOR }}>Error: {error}</div>;

  if (!keywords.length) {
    return (
      <div className={`col-span-12 mt-5 mx-0`}>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm ">
          <div className="flex justify-between mb-6 flex-col ml-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)] mr-2"></span>
              Top Keywords
            </h3>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-2">
              No data available.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(keywords.length / rowsPerPage);
  const paginatedKeywords = keywords.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePrevPage = () => setCurrentPage((page) => Math.max(page - 1, 1));
  const handleNextPage = () => setCurrentPage((page) => Math.min(page + 1, totalPages));

  // Render Keywords List view
  const renderKeywordsList = (data) => (
    <div className="flex-grow no-scrollbar space-y-4">
      {data.map((item, i) => {
        const Icon = iconMap[item.icon];
        return (
          <div
            key={i}
            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: item.color === "green" ? `${GREEN_COLOR}33` : `${RED_COLOR}33` }}
            >
              <Icon style={{ color: item.color === "green" ? GREEN_COLOR : RED_COLOR }} className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.title}</p>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.mentions} mentions</div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full"
                  style={{ width: item.percentage, backgroundColor: item.color === "green" ? GREEN_COLOR : RED_COLOR }}
                />
              </div>
            </div>
            <div
              className="text-xs font-medium w-10 h-6 flex items-center justify-center rounded-2xl"
              style={{ backgroundColor: item.color === "green" ? GREEN_COLOR : RED_COLOR, color: "#fff" }}
            >
              {item.percentage}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Render Table view for preview
  const renderTable = (data) => (
    <div className="max-h-[320px] no-scrollbar border border-gray-300 dark:border-gray-700 rounded">
      <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 sticky top-0">
          <tr>
            <th className="px-3 py-2">Category</th>
            <th className="px-3 py-2">Mentions</th>
            <th className="px-3 py-2">Positive %</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-b border-gray-200 dark:border-gray-700">
              <td className="px-3 py-2">{row.title}</td>
              <td className="px-3 py-2">{row.mentions}</td>
              <td className="px-3 py-2">{row.percentage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      {/* Main Card (clickable) */}
      <div
        ref={chartRef}
        className={`col-span-12 lg:col-span-${sidebarOpen ? 8 : 12} mt-5 mx-0 transition-all duration-300 cursor-pointer hover:ring-2 ring-blue-300 rounded-lg`}
        onClick={() => setModalOpen(true)}
        tabIndex={0}
        role="button"
        aria-label="Open top keywords details"
      >
        <div className="rounded-xl border border-gray-200 h-130 dark:border-gray-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm flex flex-col">
          <div className="flex justify-between mb-6 flex-col ml-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)] mr-2"></span>
              Top Keywords
            </h3>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Most mentioned keywords and their sentiment score
            </div>
          </div>

          {showData ? renderTable(paginatedKeywords) : renderKeywordsList(paginatedKeywords)}

          {/* Pagination */}
          <div
            className="sticky bottom-0 z-10 flex justify-center items-center space-x-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-4"
            style={{ marginTop: "auto" }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevPage();
              }}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md border ${
                currentPage === 1
                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                  : "border-sky-900 text-sky-900 hover:bg-indigo-50 cursor-pointer"
              }`}
            >
              <FaArrowLeft />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextPage();
              }}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md border ${
                currentPage === totalPages
                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                  : "border-sky-900 text-sky-900 cursor-pointer hover:bg-indigo-50"
              }`}
            >
              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {modalOpen && (
  <DetailsModal
    open={modalOpen}
    onClose={() => {
      setModalOpen(false);
      setShowData(false);
    }}
    title="Top Keywords"
    description="List of the most mentioned keywords and their sentiment scores."
    onPreview={() => setShowData((v) => !v)}
    onDownload={downloadCSV}
    onShare={shareChart}
    previewActive={showData}
  >
    {/* Scroll only the data list/table, keep header and footer fixed */}
    <div className="max-h-[49vh] no-scrollbar pr-1">
      {showData ? renderTable(keywords) : renderKeywordsList(keywords)}
    </div>
  </DetailsModal>
)}
    </>
  );
};

export default TopKeywords;
