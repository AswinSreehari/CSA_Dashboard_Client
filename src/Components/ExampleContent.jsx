import React, { useState } from "react";
import DashboardFilter from "../Components/Filters/DashboardFilter";
import FilterChips from "../Components/Filters/FilterChips";
import {
  Sun,
  Moon,
  User,
} from "lucide-react";
import TopSection from "../Components/TopSection";
import TopKeywords from "../Components/TopKeywords";
import SentimentDistribution from "../Components/SentimentDistribution";
import PlatformBreakdown from "../Components/PlatformBreakdown";
import SentimentOvertime from "../Components/SentimentOvertime";
import MentionVolumeChart from "../Components/MentionVolume";
import SentimentRanking from "../Components/SentimentRanking";
import MultiDimensionalComparison from "../Components/MultiDimentional";

const ExampleContent = ({ isDark, setIsDark }) => {
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    platform: "all",
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back to your dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <FilterChips />
          <DashboardFilter filters={undefined} setFilters={handleFilterChange} />
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <button className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>

      <TopSection />

      {/* Content Grid */}
      <div className="min-w-0 grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        <div className="min-w-0">
          <TopKeywords />
        </div>
        <div className="min-w-0">
          <SentimentDistribution filters={filters} />
        </div>
      </div>
      <div className="flex gap-4">
        <PlatformBreakdown filters={filters} />
        <SentimentOvertime filters={filters} />
      </div>
      <div>
        <MentionVolumeChart filters={filters} />
      </div>
      <div className="flex gap-10">
        <SentimentRanking filters={filters} />
        <MultiDimensionalComparison filters={filters} />
      </div>
    </div>
  );
};

export default ExampleContent;
