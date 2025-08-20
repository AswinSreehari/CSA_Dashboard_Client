 "use client"
import React, { useState, useEffect } from "react";
import {
  Home,
  DollarSign,
  Monitor,
  ShoppingCart,
  Tag,
  BarChart3,
  Users,
  ChevronDown,
  ChevronsRight,
  Moon,
  Sun,
  TrendingUp,
  Activity,
  Package,
  Bell,
  Settings,
  HelpCircle,
  User,
} from "lucide-react";
import TopSection from "../Components/TopSection";
import TopKeywords from "../Components/TopKeywords";
import SentimentDistribution from "../Components/SentimentDistribution";
import PlatformBreakdown from "../Components/PlatformBreakdown";
import SentimentOvertime from "../Components/SentimentOvertime";
import MentionVolumeChart from "../Components/MentionVolume";
import SentimentRanking from "../Components/SentimentRanking";

import axios from 'axios';
import MultiDimensionalComparison from "../Components/MultiDimentional";
import FilterChips from "../Components/Filters/FilterChips";
const BASE_URL = import.meta.env.VITE_BASE_URL;
 

export const Example = () => {
  const [isDark, setIsDark] = useState(true);
    const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
        <Sidebar />
        <ExampleContent isDark={isDark} setIsDark={setIsDark} />
      </div>
    </div>
  );
};

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Dashboard");

  return (
    <nav
      className={`sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out ${
        open ? 'w-64' : 'w-16'
      } border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-sm`}
    >
      <TitleSection open={open} />

      <div className="space-y-1 mb-8">
        <Option
          Icon={Home}
          title="Dashboard"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
         <Option
          Icon={BarChart3}
          title="Analytics"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
         {/* <Option
          Icon={Tag}
          title="Tags"
          selected={selected}
          setSelected={setSelected}
          open={open}
        /> */}
        {/* <Option
          Icon={DollarSign}
          title="Sales"
          selected={selected}
          setSelected={setSelected}
          open={open}
          notifs={3}
        />
        <Option
          Icon={Monitor}
          title="View Site"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={ShoppingCart}
          title="Products"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
       
        <Option
          Icon={BarChart3}
          title="Analytics"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={Users}
          title="Members"
          selected={selected}
          setSelected={setSelected}
          open={open}
          notifs={12}
        /> */}
      </div>

      {open && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-1">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Account
          </div>
          <Option
            Icon={Settings}
            title="Settings"
            selected={selected}
            setSelected={setSelected}
            open={open}
          />
          <Option
            Icon={HelpCircle}
            title="Help & Support"
            selected={selected}
            setSelected={setSelected}
            open={open}
          />
        </div>
      )}

      <ToggleClose open={open} setOpen={setOpen} />
    </nav>
  );
};

const Option = ({ Icon, title, selected, setSelected, open, notifs }) => {
  const isSelected = selected === title;
  
  return (
    <button
      onClick={() => setSelected(title)}
      className={`relative flex h-11 w-full items-center rounded-md transition-all duration-200 ${
        isSelected 
          ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm border-l-2 border-blue-500" 
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
      }`}
    >
      <div className="grid h-full w-12 place-content-center">
        <Icon className="h-4 w-4" />
      </div>
      
      {open && (
        <span
          className={`text-sm font-medium transition-opacity duration-200 ${
            open ? 'opacity-100' : 'opacity-0'
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
                  {/* <span className="block text-xs text-gray-500 dark:text-gray-400">
                    Pro Plan
                  </span> */}
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
            className={`h-4 w-4 transition-transform duration-300 text-gray-500 dark:text-gray-400 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
        {open && (
          <span
            className={`text-sm font-medium text-gray-600 dark:text-gray-300 transition-opacity duration-200 ${
              open ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Hide
          </span>
        )}
      </div>
    </button>
  );
};

const ExampleContent = ({ isDark, setIsDark }) => {
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
     {/* Responsive, wraps automatically when space shrinks (e.g., sidebar open) */}
<div className="min-w-0 grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
  <div className="min-w-0">
    <TopKeywords />
  </div>
  <div className="min-w-0">
    <SentimentDistribution />
  </div>
</div>
  <div className="flex gap-4">
    <PlatformBreakdown />
    <SentimentOvertime />
  </div>
  <div>
    <MentionVolumeChart />
  </div>
  <div className="flex gap-10">
    <SentimentRanking />
    <MultiDimensionalComparison />
  </div>
  


    </div>
  );
};

export default Example;









{/* Quick Stats */}
{/* <div className="space-y-6">
  <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Stats</h3>
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</span>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">3.2%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '32%' }}></div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">Bounce Rate</span>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">45%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '45%' }}></div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">Page Views</span>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">8.7k</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
      </div>
    </div>
  </div>

  <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Products</h3>
    <div className="space-y-3">
      {['iPhone 15 Pro', 'MacBook Air M2', 'AirPods Pro', 'iPad Air'].map((product, i) => (
        <div key={i} className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">{product}</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            ${Math.floor(Math.random() * 1000 + 500)}
          </span>
        </div>
      ))}
    </div>
  </div>
</div> */}