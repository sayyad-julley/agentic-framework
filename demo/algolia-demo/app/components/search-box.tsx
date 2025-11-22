"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useSearchBox } from "react-instantsearch";
import { Input } from "antd";
import type { InputRef } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { debounce } from "lodash";

/**
 * Custom Search Box with Debouncing
 * 
 * Best Practices:
 * - 300ms debounce to prevent queries on every keystroke
 * - Reduces operation count and costs
 * - Improves UX by avoiding flickering results
 */
export function SearchBox() {
  const { query, refine } = useSearchBox();
  const [inputValue, setInputValue] = useState(query);
  const inputRef = useRef<InputRef>(null);

  // Debounce the refine function to avoid excessive queries
  const debouncedRefine = useMemo(
    () => debounce((value: string) => refine(value), 300),
    [refine]
  );

  // Sync input with InstantSearch query (for URL routing, etc.)
  useEffect(() => {
    if (query !== inputValue && !inputRef.current?.input?.matches(':focus')) {
      setInputValue(query);
    }
  }, [query, inputValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedRefine(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    debouncedRefine.cancel();
    refine(inputValue);
    inputRef.current?.input?.blur();
  };

  const handleReset = () => {
    setInputValue("");
    debouncedRefine.cancel();
    refine("");
    inputRef.current?.input?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <Input
        ref={inputRef}
        size="large"
        placeholder="Search for products..."
        prefix={<SearchOutlined />}
        value={inputValue}
        onChange={handleChange}
        allowClear
        onClear={handleReset}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="w-full"
      />
    </form>
  );
}

