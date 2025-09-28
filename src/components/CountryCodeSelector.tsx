import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { countries, Country } from "@/lib/countries";

interface CountryCodeSelectorProps {
  value: Country;
  onValueChange: (country: Country) => void;
  disabled?: boolean;
}

export const CountryCodeSelector = ({ value, onValueChange, disabled }: CountryCodeSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    country.dialCode.includes(searchValue) ||
    country.code.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-[140px] justify-between"
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">{value.flag}</span>
            <span className="text-sm font-medium">{value.dialCode}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search countries..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList className="max-h-[200px]">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {filteredCountries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.code}
                  onSelect={() => {
                    onValueChange(country);
                    setOpen(false);
                    setSearchValue("");
                  }}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <span className="text-lg">{country.flag}</span>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{country.name}</p>
                    <p className="text-xs text-muted-foreground">{country.dialCode}</p>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value.code === country.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
