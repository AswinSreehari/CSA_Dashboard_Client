"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ListFilter } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import axios from "axios";

const platformOptions = [
  { id: "all", name: "All Platforms" },
  { id: "twitter", name: "Twitter" },
  { id: "facebook", name: "Facebook" },
  { id: "instagram", name: "Instagram" },
];

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function DashboardFilter() {
  const [open, setOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [commandInput, setCommandInput] = useState("");
  const [data, setData] = useState(null);  
  const commandInputRef = useRef(null);

   useEffect(() => {
    async function fetchFilteredData() {
      try {
         if (!selectedPlatform || selectedPlatform === "all") {
        setData(null); 
        return;
      }
        const platformQuery = selectedPlatform && selectedPlatform !== "all" ? selectedPlatform : "";
        const res = await axios.get(`${BASE_URL}/api/feedback/filterdata`, {
          params: { platform: platformQuery },
        });
        setData(res.data.data);  
        console.log("Dataaa-....>",res.data.data)
      } catch (error) {
        console.error("Failed to fetch filtered data:", error);
      }
    }

    fetchFilteredData();
  }, [selectedPlatform]);

  // Select a platform from the list
  const onSelectPlatform = (id) => {
    setSelectedPlatform(id);
    setOpen(false);
    setCommandInput("");
    commandInputRef.current?.blur();
  };

   const removePlatform = () => setSelectedPlatform(null);

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
            size="sm"
            className="transition group h-6 text-xs items-center rounded-sm flex gap-1.5"
          >
            <ListFilter className="size-3 shrink-0 transition-all text-muted-foreground group-hover:text-primary" />
            {"Add Filter"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-0">
          <Command>
            <CommandInput
              placeholder="Search platform..."
              className="h-9"
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

      {/* Capsule Chip for Selected Platform */}
      {selectedPlatform && selectedPlatform !== "all" && (
        <div
          className="flex items-center mt-2 rounded-full border border-gray-300 bg-white px-3 py-1 text-gray-800 text-base"
          style={{
            fontSize: "1rem",
            fontWeight: 400,
            boxShadow: "0 1px 2px 0 rgba(16,30,54,.02)",
          }}
        >
          <span className="text-gray-500">Platform</span>
          <span className="mx-1 text-gray-300">|</span>
          <span className="font-semibold text-gray-900">
            {getPlatformName(selectedPlatform)}
          </span>
          <button
            onClick={removePlatform}
            className="ml-2 text-gray-400 hover:text-gray-700 focus:outline-none rounded-full"
            aria-label="Remove"
            type="button"
            style={{ marginLeft: 8, fontSize: "1.1rem", lineHeight: "1" }}
          >
            X
          </button>
        </div>
      )}

        
    </div>
  );
}
