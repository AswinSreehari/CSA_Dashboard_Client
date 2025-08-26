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
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [commandInput, setCommandInput] = useState("");
  const [data, setData] = useState(null);
  const commandInputRef = useRef(null);

  // Sync local selectedPlatform state with parent's filters
  useEffect(() => {
    const platformFilter = filters.find((f) => f.type === "platform");
    setSelectedPlatform(platformFilter ? platformFilter.value : null);
  }, [filters]);

  useEffect(() => {
    async function fetchFilteredData() {
      try {
        if (!selectedPlatform || selectedPlatform === "all") {
          setData(null);
          onDataChange(null);
          return;
        }
        const res = await axios.get(`${BASE_URL}/api/feedback/filterdata`, {
          params: { platform: selectedPlatform },
        });
        setData(res.data.data);
        onDataChange(res.data.data);
      } catch (error) {
        console.error("Failed to fetch filtered data:", error);
      }
    }
    fetchFilteredData();
  }, [selectedPlatform, onDataChange]);

  const onSelectPlatform = (id) => {
    // Update parent's filters to add/update platform filter
    const newFilters = filters.filter((f) => f.type !== "platform");
    if (id !== "all") {
      newFilters.push({ id: id, type: "platform", value: id });
    }
    onFilterChange(newFilters);
    setOpen(false);
    setCommandInput("");
    commandInputRef.current?.blur();
  };

  const removePlatform = (e) => {
    e.stopPropagation(); // Prevent popover toggle when clicking X
    // Remove platform filter from parent's filters
    const newFilters = filters.filter((f) => f.type !== "platform");
    onFilterChange(newFilters);
    setSelectedPlatform(null);
  };

  const getPlatformName = (id) =>
    platformOptions.find((p) => p.id === id)?.name || id;

  return (
    <div className="flex flex-col items-start">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            size="m"
            className="transition group h-10 w-48 text-sm items-center rounded-sm flex gap-2 px-3  "
          >
            {selectedPlatform && selectedPlatform !== "all" ? (
              <>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {getPlatformName(selectedPlatform)}
                </span>
                <button
                  onClick={removePlatform}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none rounded-full"
                  aria-label="Remove"
                  type="button"
                  style={{ fontSize: "1.2rem", lineHeight: "1" }}
                >
                  x
                </button>
              </>
            ) : (
              <>
                <ListFilter className="size-5 shrink-0 transition-all text-muted-foreground group-hover:text-primary" />
                {"Add Filter"}
              </>
            )}
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
                      onSelect={() => onSelectPlatform(platform.id)}
                    >
                      {platform.name}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
