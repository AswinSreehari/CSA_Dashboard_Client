"use client";

import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { ListFilter } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import axios from "axios";

const platformOptions = [
  { id: "all", name: "All Platforms" },
  { id: "twitter", name: "Twitter" },
  { id: "facebook", name: "Facebook" },
  { id: "instagram", name: "Instagram" },
  { id: "crm", name: "Crm" },
  { id: "flipkart", name: "Flipkart" },
  { id: "reddit", name: "Reddit" },
];

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function DashboardFilter({
  filters,
  onDataChange,
  onFilterChange,
}) {
  const [open, setOpen] = useState(false);
  // Now selectedPlatforms hold multiple selections as array
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [commandInput, setCommandInput] = useState("");
  const [data, setData] = useState(null);
  const commandInputRef = useRef(null);

  // Sync local selectedPlatforms with parent's filters
  useEffect(() => {
    const platformFilters = filters.filter((f) => f.type === "platform");
    // Extract platform values
    setSelectedPlatforms(platformFilters.map((f) => f.value));
  }, [filters]);

  useEffect(() => {
    async function fetchFilteredData() {
      try {
        // If no filter or 'all', clear data for full dataset
        if (
          !selectedPlatforms.length ||
          (selectedPlatforms.length === 1 && selectedPlatforms[0] === "all")
        ) {
          setData(null);
          onDataChange(null);
          return;
        }
        // Send 'platforms' as array query param
        const res = await axios.get(`${BASE_URL}/api/feedback/filterdata`, {
          params: { platforms: selectedPlatforms },
          paramsSerializer: (params) => {
            return new URLSearchParams(
              Object.entries(params).flatMap(([k, v]) =>
                Array.isArray(v) ? v.map((val) => [k, val]) : [[k, v]]
              )
            ).toString();
          },
        });
        setData(res.data.data);
        onDataChange(res.data.data);
      } catch (error) {
        console.error("Failed to fetch filtered data:", error);
      }
    }
    fetchFilteredData();
  }, [selectedPlatforms, onDataChange]);

  // Toggle platform selection for multi-select
  const onTogglePlatform = (id) => {
    let newSelected;
    if (id === "all") {
      // Selecting "all" clears others
      newSelected = ["all"];
    } else {
      if (selectedPlatforms.includes(id)) {
        newSelected = selectedPlatforms.filter((p) => p !== id);
        // If none selected, default to all
        if (newSelected.length === 0) newSelected = ["all"];
      } else {
        newSelected = selectedPlatforms
          .filter((p) => p !== "all")
          .concat(id);
      }
    }

    // Update parent's filter list
    const newFilters = filters.filter((f) => f.type !== "platform");
    if (!(newSelected.length === 1 && newSelected[0] === "all")) {
      newSelected.forEach((p) =>
        newFilters.push({ id: p, type: "platform", value: p })
      );
    }
    onFilterChange(newFilters);
    setOpen(false);
    setCommandInput("");
    commandInputRef.current?.blur();
  };

  // Remove a platform from selection
  const removePlatform = (id) => {
    const newSelected = selectedPlatforms.filter((p) => p !== id);
    const newFilters = filters.filter((f) => f.type !== "platform");
    if (newSelected.length > 0) {
      newSelected.forEach((p) =>
        newFilters.push({ id: p, type: "platform", value: p })
      );
    } else {
      // Reset to all if empty
      newFilters.push({ id: "all", type: "platform", value: "all" });
    }
    onFilterChange(newFilters);
  };

  const getPlatformName = (id) =>
    platformOptions.find((p) => p.id === id)?.name || id;

  return (
    <div className="flex  flex-row-reverse gap-4 space-x-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            size="m"
            className="transition group h-10 w-40 text-sm items-center rounded-sm flex gap-1 px-3 justify-between"
          >
            <div className="flex items-center gap-1">
              <ListFilter className="size-5 shrink-0 transition-all text-muted-foreground group-hover:text-primary" />
              <span>Add Filter</span>
            </div>
            {/* <span>
              {selectedPlatforms.length > 0 && !selectedPlatforms.includes("all")
                ? `${selectedPlatforms.length} selected`
                : ""}
            </span> */}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0">
          <Command>
            <CommandInput
              placeholder="Search platform..."
              className="h-10 text-sm"
              value={commandInput}
              onInputCapture={(e) => setCommandInput(e.currentTarget.value)}
              ref={commandInputRef}
            />
            <CommandList>
              <CommandGroup>
                {platformOptions
                  .filter((p) =>
                    p.name.toLowerCase().includes(commandInput.toLowerCase())
                  )
                  .map((platform) => (
                    <CommandItem
                      key={platform.id}
                      onSelect={() => onTogglePlatform(platform.id)}
                    >
                      <input
                        type="checkbox"
                        checked={
                          selectedPlatforms.includes("all")
                            ? platform.id === "all"
                            : selectedPlatforms.includes(platform.id)
                        }
                        readOnly
                        className="mr-2"
                      />
                      {platform.name}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected platform chips */}
      <div className="flex flex-wrap gap-2">
        {selectedPlatforms
          .filter((p) => p !== "all")
          .map((platformId) => (
            <div
              key={platformId}
              className="flex items-center rounded-full border border-gray-300 bg-white px-4 py-1 text-gray-800 text-base"
              style={{
                fontSize: "1rem",
                fontWeight: 400,
                boxShadow: "0 1px 2px 0 rgba(16,30,54,.02)",
                lineHeight: 1,
                alignSelf: "flex-start",
              }}
            >
              <span className="text-gray-500">Platform</span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="font-semibold text-gray-900">{getPlatformName(platformId)}</span>
              <button
                onClick={() => removePlatform(platformId)}
                className="ml-3 text-gray-400 hover:text-gray-700 focus:outline-none rounded-full"
                aria-label="Remove"
                type="button"
                style={{ fontSize: "1.2rem", lineHeight: "1" }}
              >
                ×
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
