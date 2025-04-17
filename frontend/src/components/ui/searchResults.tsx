"use client";
import { searchResult, useSearchStore } from "@/hooks/searchStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Star,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import useSWR from "swr";
import ReactMarkdown from "react-markdown";

const fetcher = (url: string) => fetch(url).then((res) => res.text());

const TitleBadge = ({
    children
}: Readonly<{
  children: React.ReactNode;
}>) => {
    return (
    <Badge variant="secondary" className="flex items-center gap-2 p-2 px-3">
        {children}
    </Badge>
    )
}

const ResultCard: React.FC<{ result: searchResult }> = ({ result }) => {
  const { data: markdown, error } = useSWR(result.url, fetcher);
  const snippet = markdown
    ? markdown.split("\n").slice(0, 10).join("\n") + "..."
    : result.content?.slice(0, 200).replace(/\n/g, " ") + "...";

  const repoUrl = result.url
    .replace("raw.githubusercontent", "github")
    .split("/")
    .slice(0, -2)
    .join("/");

  return (
    <Card className="shadow-lg rounded-2xl hover:shadow-2xl transition-shadow">
      <CardHeader className="flex flex-col sm:flex-row sm:justify-between">
        <div>
          <CardTitle className="flex items-center justify-center gap-4 text-xl">
            <Link
              href={`/view/${encodeURIComponent(result.name)}`}
              className="hover:underline"
            >
              {result.name}
            </Link>
            {result.language && <TitleBadge>{result.language}</TitleBadge>}
            {result.stars != null && (
                <TitleBadge>
                    <Star size={14} /> <p>{result.stars}</p>
                </TitleBadge>
            )}
            <TitleBadge>
              {(100 - result.distance * 100).toFixed(1)}% match
            </TitleBadge>

          </CardTitle>
        </div>
        <CardFooter className="mt-4 sm:mt-0">
          <Button asChild variant="ghost" className="flex items-center gap-1">
            <Link href={repoUrl} target="_blank">
              View Repo <ExternalLink size={14} />
            </Link>
          </Button>
        </CardFooter>
      </CardHeader>
      <CardContent>
        <div className="bg-zinc-800/20 border border-zinc-800 prose prose-sm max-w-[50%] break-words text-gray-300 p-4 rounded-md">
          <ReactMarkdown>{snippet}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
};

export const SearchResults = () => {
  const { searchResults, isLoading } = useSearchStore();

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-8">
        <div className="text-lg font-medium text-gray-600">Loading results...</div>
      </div>
    );
  }

  if (!searchResults.length) {
    return (
      <div className="w-full text-center py-8 text-gray-500">
        No results found. Try adjusting your query.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 p-4">
      <h2 className="text-3xl font-bold mb-4">Search Results</h2>
      {searchResults.map((result: searchResult, i) => (
        <ResultCard key={result.id || result.name || i} result={result} />
      ))}
    </div>
  );
};
