"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TickerSearchProps {
  onSelect: (ticker: string) => void;
  isLoading?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function TickerSearch({ onSelect, isLoading }: TickerSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<string[]>([]);

  // Debounce search with 300ms delay
  React.useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      if (!query) {
        setResults([]);
        return;
      }
      try {
        const res = await fetch(
          `${API_URL}/api/search-tickers?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        console.error("Ticker search failed:", e);
        setResults([]);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] justify-between rounded-xl border-zinc-200 dark:border-zinc-700"
        >
          {value
            ? value
            : isLoading
              ? "Adding..."
              : "Search Ticker (e.g. AAPL)..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0 rounded-xl">
        <Command>
          <CommandInput
            placeholder="Search ticker..."
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No ticker found.</CommandEmpty>
            <CommandGroup>
              {results.map((ticker) => (
                <CommandItem
                  key={ticker}
                  value={ticker}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                    onSelect(currentValue.toUpperCase());
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === ticker ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {ticker}
                </CommandItem>
              ))}
              {/* Always show what user typed as an option if no results match exactly, to allow custom tickers */}
              {query && !results.includes(query.toUpperCase()) && (
                <CommandItem
                  value={query.toUpperCase()}
                  onSelect={() => {
                    setOpen(false);
                    onSelect(query.toUpperCase());
                  }}
                >
                  <Loader2 className="mr-2 h-4 w-4 opacity-0" />
                  Add &quot;{query.toUpperCase()}&quot;
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
