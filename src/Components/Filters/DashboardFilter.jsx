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

const platformOptions = [
  { id: "all", name: "All Platforms" },
  { id: "twitter", name: "Twitter" },
  { id: "facebook", name: "Facebook" },
  { id: "instagram", name: "Instagram" },
  { id: "crm", name: "Crm" },
  { id: "flipkart", name: "Flipkart" },
  { id: "reddit", name: "Reddit" },
];

export default function DashboardFilter({
  filters,
  onDataChange,
  onFilterChange,
}) {
  const [open, setOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [commandInput, setCommandInput] = useState("");
  const commandInputRef = useRef(null);

  // Sync selectedPlatform with filters
  useEffect(() => {
    const platformFilter = filters.find(f => f.type === "platform");
    setSelectedPlatform(platformFilter ? platformFilter.value : null);
  }, [filters]);

  // Handle selection
  const onSelectPlatform = (id) => {
    const newFilters = filters.filter(f => f.type !== "platform");
    if (id !== "all") {
      newFilters.push({ id, type: "platform", value: id });
    }
    onFilterChange(newFilters);
    setOpen(false);
    setCommandInput("");
    commandInputRef.current?.blur();
  };

  // Remove platform selected
  const removePlatform = (e) => {
    e.stopPropagation(); // prevent popover toggle on X click
    const newFilters = filters.filter(f => f.type !== "platform");
    onFilterChange(newFilters);
    setSelectedPlatform(null);
  };

  const getPlatformName = (id) =>
    platformOptions.find(p => p.id === id)?.name || id;

  return (
    <div className="flex items-center gap-4">
      {/* Selected platform chip */}
      {selectedPlatform && selectedPlatform !== "all" && (
        <div
          className="flex items-center rounded-full border border-gray-300 bg-white dark:bg-[#0f172a] dark:text-neutral-200 px-4 py-1 text-gray-800 text-base"
          style={{
            fontSize: "1rem",
            fontWeight: 400,
            boxShadow: "0 1px 2px 0 rgba(16,30,54,.02)",
            lineHeight: "1",
          }}
        >
          
          <span className="font-semibold text-gray-900  dark:text-neutral-200">{getPlatformName(selectedPlatform)}</span>
          <button
            onClick={removePlatform}
            className="ml-3 text-gray-400 hover:text-gray-700 focus:outline-none rounded-full"
            aria-label="Remove"
            type="button"
            style={{ fontSize: "1.2rem", lineHeight: "1" }}
          >
            ×
          </button>
        </div>
      )}

      {/* Add Filter Button with Popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            size="m"
            className="transition group h-10 w-48 text-sm items-center rounded-sm flex gap-2 px-3"
          >
            <ListFilter className="size-5 shrink-0 transition-all text-muted-foreground group-hover:text-primary" />
            {"Add Filter"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0">
          <Command>
            <CommandInput
              placeholder="Search platform..."
              className="h-10 text-sm"
              value={commandInput}
              onInputCapture={e => setCommandInput(e.currentTarget.value)}
              ref={commandInputRef}
            />
            <CommandList>
              <CommandGroup>
                {platformOptions
                  .filter(p => p.name.toLowerCase().includes(commandInput.toLowerCase()))
                  .map(platform => (
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
