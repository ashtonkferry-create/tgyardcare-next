'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { searchAddresses, type AddressSuggestion } from '@/lib/geocoding';

interface AddressAutocompleteProps {
  onSelect: (address: {
    full_address: string;
    city: string;
    state: string;
    zip: string;
    coordinates: [number, number];
  }) => void;
  onInputChange?: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

export function AddressAutocomplete({
  onSelect,
  onInputChange,
  defaultValue = '',
  placeholder = 'Start typing your address...',
  className = '',
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    const timeout = setTimeout(async () => {
      const results = await searchAddresses(query);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setIsLoading(false);
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [query]);

  const handleSelect = useCallback(
    (suggestion: AddressSuggestion) => {
      setQuery(suggestion.place_name);
      setIsOpen(false);
      setSuggestions([]);
      onSelect({
        full_address: suggestion.place_name,
        city: suggestion.city,
        state: suggestion.state,
        zip: suggestion.zip,
        coordinates: suggestion.coordinates,
      });
    },
    [onSelect]
  );

  const handleBlur = useCallback(() => {
    blurTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  }, []);

  const handleFocus = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  }, [suggestions.length]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    },
    []
  );

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => { setQuery(e.target.value); onInputChange?.(e.target.value); }}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 bg-[#111118] text-[#f0f0f5] border-white/10 focus:ring-emerald-500 focus:border-emerald-500"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a24] border border-white/10 rounded-lg shadow-lg z-50 overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.place_name}-${index}`}
              type="button"
              className="w-full px-4 py-3 text-left hover:bg-white/5 cursor-pointer text-sm text-[#f0f0f5] transition-colors flex items-start gap-3"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(suggestion);
              }}
            >
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" />
              <div>
                <div className="font-medium">{suggestion.address}</div>
                <div className="text-xs text-[#8888a0]">
                  {suggestion.city}, {suggestion.state} {suggestion.zip}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default AddressAutocomplete;
