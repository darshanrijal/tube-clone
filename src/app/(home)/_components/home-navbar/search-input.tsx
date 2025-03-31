"use client";
import { getBaseUrl } from "@/__rpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export const SearchInput = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const [value, setValue] = useState(query);
  const router = useRouter();
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const url = new URL("/search", getBaseUrl());
    const newQuery = value.trim();

    url.searchParams.set("query", encodeURIComponent(newQuery));

    if (categoryId) {
      url.searchParams.set("categoryId", categoryId);
    }

    if (newQuery === "") {
      url.searchParams.delete("query");
    }
    setValue(newQuery);
    router.push(url.toString());
  }
  function handleClear() {
    setValue("");
    router.push("/search");
  }
  return (
    <form className="flex w-full max-w-150" onSubmit={handleSubmit}>
      <div className="relative w-full">
        <Input
          type="text"
          placeholder="Search"
          className="w-full rounded-l-full py-2 pr-12 pl-4"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="-translate-y-1/2 absolute top-1/2 right-1 rounded-full"
          >
            <X />
          </Button>
        )}
      </div>
      <Button
        type="submit"
        className="rounded-r-full border border-l-0 px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-50"
        variant="secondary"
        disabled={!value.trim()}
      >
        <SearchIcon />
      </Button>
    </form>
  );
};
