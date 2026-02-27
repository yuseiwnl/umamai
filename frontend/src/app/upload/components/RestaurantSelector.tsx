import { useStore } from "@/lib/UseStore";
import { useCallback, useMemo, useState } from "react";
import { ControllerRenderProps } from "react-hook-form";
import { useAutocompleteSuggestions } from "./autocomplete/use-autocomplete-suggestions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface RestaurantSelectorProps {
  field: ControllerRenderProps<any, string>;
}

export default function RestaurantSelector({ field }: RestaurantSelectorProps) {
  const { setPlace } = useStore();
  const [inputValue, setInputValue] = useState("");

  const { suggestions, resetSession } = useAutocompleteSuggestions(inputValue, {
    language: "en",
    includedRegionCodes: ["jp"],
  });

  const handleInputChange = useCallback(
    (value: google.maps.places.PlacePrediction | string) => {
      if (typeof value === "string") {
        setInputValue(value);
      }
    },
    []
  );

  const predictions = useMemo(
    () =>
      suggestions
        .filter((s) => s.placePrediction)
        .map(({ placePrediction }) => placePrediction!),
    [suggestions]
  );

  const handleSelect = useCallback(
    (prediction: google.maps.places.PlacePrediction | string) => {
      if (typeof prediction === "string") return;
      const place = prediction.toPlace();
      place
        .fetchFields({
          fields: ["displayName", "formattedAddress", "location", "rating"],
        })
        .then(() => {
          resetSession();
          setPlace(place);
          field.value = place.displayName;
          console.log(field.value);
          setInputValue("");
        });
    },
    [setPlace]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-[200px] justify-between",
              !field.value && "text-muted-foreground"
            )}
          >
            {field.value || "Select restaurant"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search restaurant..."
            onValueChange={handleInputChange}
          />
          <CommandList>
            <CommandEmpty>No restaurant found.</CommandEmpty>
            <CommandGroup>
              {predictions.map((place) => (
                <CommandItem
                  key={place.placeId}
                  value={place.mainText?.text}
                  onSelect={() => handleSelect(place)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      place.mainText?.text === field.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {place.text.text}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
