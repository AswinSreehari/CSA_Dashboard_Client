 import React, { useContext, useState } from "react";

const FilterContext = React.createContext();

export function useFilters() {
  return useContext(FilterContext);
}

export function FilterProvider({ children }) {
   const [filters, setFilters] = useState({
    brands: [],     
    colors: [],     
    dateRange: null,
    platforms: [],  
  });

  // Add/remove single filter value helper
  function updateFilter(key, value) {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function clearFilter(key) {
    setFilters(prev => ({
      ...prev,
      [key]: Array.isArray(prev[key]) ? [] : null
    }));
  }

  return (
    <FilterContext.Provider value={{ filters, updateFilter, clearFilter }}>
      {children}
    </FilterContext.Provider>
  );
}
