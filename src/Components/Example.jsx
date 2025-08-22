import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar"; 
import ExampleContent from "./ExampleContent";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Example = () => {
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
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
        <Sidebar />
        <ExampleContent isDark={isDark} setIsDark={setIsDark} />
      </div>
    </div>
  );
};

export default Example;
