import React from "react";
import { useFilters } from "../contexts/FilterContext";

// Icon for color chip/swatches (basic)
const ColorDot = ({ color }) => (
  <span
    style={{
      backgroundColor: color.toLowerCase() || "#444",
      borderRadius: "50%",
      width: 14,
      height: 14,
      display: "inline-block",
      marginRight: 6,
      border: "1px solid #ccc",
      verticalAlign: "middle"
    }}
  />
);

const FilterChips = () => {
  const { filters, clearFilter, updateFilter } = useFilters();

  return (
    <div className="flex flex-wrap gap-2 py-4 pl-1">
      {filters.brands.map((brand, idx) => (
        <div key={brand} className="flex items-center bg-gray-100 dark:bg-[#1e293b] px-3 py-1 rounded-full text-sm shadow-sm">
          {brand}
          <button className="ml-2 focus:outline-none" onClick={() => {
            updateFilter("brands", filters.brands.filter((b) => b !== brand));
          }}>✕</button>
        </div>
      ))}
      {filters.colors.map((color, i) => (
        <div key={color} className="flex items-center bg-gray-100 dark:bg-[#1e293b] px-3 py-1 rounded-full text-sm shadow-sm">
          <ColorDot color={color} />
          {color}
          <button className="ml-2 focus:outline-none" onClick={() => {
            updateFilter("colors", filters.colors.filter((c) => c !== color));
          }}>✕</button>
        </div>
      ))}
      {/* Add more chips for platform, date, etc. */}
      {/* Example for resetting all filters: */}
      {(filters.brands.length > 0 || filters.colors.length > 0) && (
        <button className="ml-2 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs" onClick={() => {
          clearFilter("brands");
          clearFilter("colors");
          // likewise for other filters...
        }}>Clear all</button>
      )}
    </div>
  );
};

export default FilterChips;
