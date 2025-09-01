"use client"
import React, { useState, useEffect, useMemo } from "react";
import {
  Home,
  BarChart3,
  Database,
  ChevronDown,
  ChevronsRight,
  Moon,
  Sun,
  User,
  Settings,
  HelpCircle,
  Tag,
  Smile,
  Hash,
  Frown,
  Layers,
  Box,
  Globe,
  FileText,
  TrendingUp,
  Timer,
} from "lucide-react";
import TopSection from "../Components/TopSection";
import TopKeywords from "../Components/TopKeywords";
import SentimentDistribution from "../Components/SentimentDistribution";
import PlatformBreakdown from "../Components/PlatformBreakdown";
import SentimentOvertime from "../Components/SentimentOvertime";
import MentionVolumeChart from "../Components/MentionVolume";
import SentimentRanking from "../Components/SentimentRanking";
import DashboardFilter from "../Components/Filters/DashboardFilter";

import axios from 'axios';
import MultiDimensionalComparison from "../Components/MultiDimentional";
import FilterChips from "../Components/Filters/FilterChips";
import DataSource from "../Components/DataSource";
import TrendingModelsBarRace from "../Components/TrendingRaceModel";
import ProductMentionsTreemap from "../Components/ProductMentionTreemap";
import BrandComparisonChart from "../Components/BrandComparision";
import EmotionSourceHeatmap from "../Components/EmotionSourceHeatmap";
import NegativeEmotionsBreakdown from "../Components/NegativeEmotionBreakdown";
import TopNegativeDriversWaterfallChart from "../Components/TopNegativeDrivers";
const BASE_URL = import.meta.env.VITE_BASE_URL;



export const Example = () => {
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    platform: "all",
  });

  useEffect(() => {
    async function importData() {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/api/feedback/import-mock`);
        setMessage(response.data.message || 'Data imported successfully');
      } catch (error) {
        setMessage('Import failed: ' + (error.response?.data?.error || error.message));
      } finally {
        setLoading(false);
      }
    }
    importData();
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className={`flex min-h-screen w-full ${isDark ? 'dark' : ''}`}>
      <div className="flex w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <Sidebar
          selected={selectedMenu}
          setSelected={setSelectedMenu}
          open={open}
          setOpen={setOpen}
        />
        <ExampleContent
          isDark={isDark}
          setIsDark={setIsDark}
          selectedMenu={selectedMenu}
        />
      </div>
    </div>
  );
};


const Sidebar = ({ selected, setSelected, open, setOpen }) => {
  // Define sections with titles and optional icons
  const sections = [
    { title: "Dashboard", Icon: Home },
    { title: "Data Source", Icon: Database },
    // { title: "Trends", Icon: BarChart3 },  
    { title: "Mention Overtime", Icon: Timer },
    { title: "Emotions", Icon: Smile },
    { title: "Keywords & Topics", Icon: Hash },
    { title: "Negative Drivers", Icon: Frown },
    { title: "Brand Comparison", Icon: Layers },
    { title: "Product Models", Icon: Box },
    // { title: "Geo Insights", Icon: Globe },  
    // { title: "LLM Insights", Icon: FileText },  
    { title: "Funnels & Engagement", Icon: TrendingUp },
    { title: "Reports & Exports", Icon: FileText },
    { title: "Settings", Icon: Settings },
  ];

  return (
    <nav
      className={`sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out ${open ? 'w-64' : 'w-16'
        } border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-sm`}
    >
      <TitleSection open={open} />

      <div className="space-y-1 mb-8 cursor-pointer ">
        {sections.map(({ title, Icon }) => (
          <Option
            key={title}
            Icon={Icon}
            title={title}
            selected={selected}
            setSelected={setSelected}
            open={open}
          />
        ))}
      </div>

      {open && (
        <div className="border-t border-gray-200 dark:border-gray-800   space-y-1  ">
          {/* <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Account
          </div> */}
          {/* <Option
            Icon={Settings}
            title="Settings"
            selected={selected}
            setSelected={setSelected}
            open={open}
          /> */}
          {/* <Option
            Icon={HelpCircle}
            title="Help & Support"
            selected={selected}
            setSelected={setSelected}
            open={open}
          /> */}
        </div>
      )}
<div className=" relaative mt-auto">
<ToggleClose open={open} setOpen={setOpen} />
</div>
    </nav>
  );
};



const Option = ({ Icon, title, selected, setSelected, open, notifs }) => {
  const isSelected = selected.toLowerCase() === title.toLowerCase();

  return (
    <button
      onClick={() => setSelected(title.toLowerCase())}
      className={`relative flex h-11 w-full items-center rounded-md cursor-pointer transition-all duration-200 ${isSelected
        ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm border-l-2 border-blue-500"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
        }`}
      type="button"
    >
      <div className="grid h-full w-12 place-content-center">
        <Icon className="h-4 w-4" />
      </div>

      {open && (
        <span
          className={`text-sm font-medium transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"
            }`}
        >
          {title}
        </span>
      )}

      {notifs && open && (
        <span className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 dark:bg-blue-600 text-xs text-white font-medium">
          {notifs}
        </span>
      )}
    </button>
  );
};


const TitleSection = ({ open }) => {
  return (
    <div className="mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
      <div className="flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
        <div className="flex items-center gap-3">
          <Logo />
          {open && (
            <div className={`transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center gap-2">
                <div>
                  <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Sentiment Dashboard
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        {open && (
          <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        )}
      </div>
    </div>
  );
};


const Logo = () => {
  return (
    <div className="grid size-10 shrink-0 place-content-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
      <svg
        width="20"
        height="auto"
        viewBox="0 0 50 39"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="fill-white"
      >
        <path
          d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z"
        />
        <path
          d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z"
        />
      </svg>
    </div>
  );
};


const ToggleClose = ({ open, setOpen }) => {
  return (
    <button
      onClick={() => setOpen(!open)}
      className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      <div className="flex items-center p-3">
        <div className="grid size-10 place-content-center">
          <ChevronsRight
            className={`h-4 w-4 transition-transform duration-300 text-gray-500 dark:text-gray-400 ${open ? "rotate-180" : ""
              }`}
          />
        </div>
        {open && (
          <span
            className={`text-sm font-medium cursor-pointer text-gray-600 dark:text-gray-300 transition-opacity duration-200 
    ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          >
            Hide
          </span>

        )}
      </div>
    </button>
  );
};


const ExampleContent = ({ isDark, setIsDark, selectedMenu }) => {
  // Filters as object state
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    platform: "all",
  });

  // Filtered data fetched after applying filter
  const [filteredData, setFilteredData] = useState(null);

  // Map filters object to array for DashboardFilter UI
  const filtersArray = useMemo(() => {
    return Object.entries(filters)
      .filter(([_, value]) => value !== "" && value !== "all")
      .map(([type, value]) => ({
        id: type,
        type,
        value,
      }));
  }, [filters]);

  // Update filters object state from DashboardFilter array updates
  const handleFilterChange = (newFiltersArray) => {
    const newFiltersObj = {};
    newFiltersArray.forEach(({ type, value }) => {
      newFiltersObj[type] = value;
    });
    setFilters({
      dateFrom: newFiltersObj.dateFrom || "",
      dateTo: newFiltersObj.dateTo || "",
      platform: newFiltersObj.platform || "all",
    });
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 ">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome!  
          </h1>
          {/* <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back to your dashboard
          </p> */}
        </div>
        <div className="flex items-center gap-4">
          <FilterChips />
          <DashboardFilter
            filters={filtersArray}
            onFilterChange={handleFilterChange}
            onDataChange={setFilteredData}
          />
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex h-10 w-10 items-center justify-center cursor-pointer rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>

      {selectedMenu === "dashboard" && (
        <>
          <TopSection />

          {/* Content Grid */}
          <div className="min-w-0 grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            <div className="min-w-0">
              <TopKeywords filteredData={filteredData} />
            </div>
            <div className="min-w-0">
              <SentimentDistribution filteredData={filteredData} />
            </div>
          </div>

          {/* <div className="flex ">
            <PlatformBreakdown filteredData={filteredData} />
            <SentimentOvertime filteredData={filteredData} />
          </div> */}

          <div className="min-w-0 grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            <div className="min-w-0 ">
              <PlatformBreakdown filteredData={filteredData} />
            </div>
            <div className="min-w-0">
              <SentimentOvertime filteredData={filteredData} />
            </div>
            </div>



          <div>
            <MentionVolumeChart filteredData={filteredData} />
          </div>

    

          <div className="min-w-0 grid gap-5  [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            <div className="min-w-0 ">
              <MultiDimensionalComparison filteredData={filteredData} />
            </div>
            <div className="min-w-0">
              <SentimentRanking filteredData={filteredData} />
            </div>
          </div>
          <div className="min-w-0 grid gap-5  [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            <div className="min-w-0 ">
              < TrendingModelsBarRace filteredData={filteredData} />
            </div>
            <div className="min-w-0">
              <ProductMentionsTreemap filteredData={filteredData} />
            </div>
          </div>

          <div className="min-w-0 grid gap-5  [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            <div className="min-w-0 mt-0 ">
              <EmotionSourceHeatmap filteredData={filteredData} />
            </div>
            <div className="min-w-0  ">
              <BrandComparisonChart filteredData={filteredData} />
            </div>
          </div>

          <div className="min-w-0 grid gap-5  [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            <div className="min-w-0 ">
              <NegativeEmotionsBreakdown filteredData={filteredData} />
            </div>
            <div className="min-w-0  ">
              <TopNegativeDriversWaterfallChart filteredData={filteredData} />
            </div>
          </div>


        </>
      )}

      {selectedMenu === "data source" && <DataSource />}

      {selectedMenu === "emotions" &&
        <div className="min-w-0 grid gap-5  [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          <div className="min-w-0 ">
            <SentimentDistribution />
          </div>
          <div className="min-w-0  ">
            <NegativeEmotionsBreakdown />
          </div>
        </div>
      }

      {selectedMenu === "negative drivers" &&
        <div className="min-w-0 grid gap-5  [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          <div className="min-w-0 ">
            <TopNegativeDriversWaterfallChart />
          </div>
          <div className="min-w-0  ">
          </div>
        </div>
      }

      {selectedMenu === "keywords & topics" &&
        <div className="min-w-0 grid gap-5  [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          <div className="min-w-0 ">
            <TopKeywords />
          </div>
          <div className="min-w-0  ">
            <MultiDimensionalComparison />
          </div>
        </div>
      }

      {selectedMenu === "mention overtime" && <MentionVolumeChart /> }

      {selectedMenu === "brand comparison" &&
        <div className="min-w-0 grid gap-5  [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          <div className="min-w-0 ">
            <BrandComparisonChart />
          </div>
          <div className="min-w-0  ">
          </div>
        </div>
      }

      {selectedMenu === "product models" &&
        <div className="min-w-0 grid gap-5  [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          <div className="min-w-0 ">
            <ProductMentionsTreemap />
          </div>
          <div className="min-w-0  ">
          </div>
        </div>
      }


    </div>
  );
};

export default Example;
