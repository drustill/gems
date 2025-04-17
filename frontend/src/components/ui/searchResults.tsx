"use client";
import { searchResult, useSearchStore } from "@/hooks/searchStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
} from "lucide-react";
import Link from "next/link";
import React, {useState, useRef, useEffect} from "react";
import useSWR from "swr";
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw'
import { useRouter } from "next/navigation";

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
  const router = useRouter()
  const {searchText} = useSearchStore()
  const snippet = markdown
    ? markdown.split("\n").slice(0, 100).join("\n") + "\n\n\n\n..."
    : result.content?.slice(0, 200).replace(/\n/g, " ") + "...";

  const repoUrl = result.url
    .replace("raw.githubusercontent", "github")
    .split("/")
    .slice(0, -2)
    .join("/");


  return (
    <Link href={repoUrl} target="_blank" className="block">
    <Card className="shadow-lg rounded-2xl hover:shadow-2xl transition-shadow">
      <CardHeader className="flex flex-col sm:flex-row sm:justify-between">
        <div>
          <CardTitle className="flex items-center justify-center gap-4 text-2xl">
            {/* <Link */}
            <div
              onClick={(e) => {
                e.preventDefault()
                router.push(`/view/${encodeURIComponent(result.name)}`)
              }}
              className="hover:underline"
              >
              {result.owner}/{result.name}
            </div>
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
      </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="text-xs italic text-gray-400 mb-1">Repository Summary</div>
              <div className="h-72 overflow-y-auto bg-zinc-800/20 border border-zinc-800 prose prose-sm prose-invert break-words text-gray-300 p-4 rounded-md">
                {result.summary}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-xs italic text-gray-400 mb-1">README.md preview</div>
              <div className="h-72 overflow-y-auto bg-zinc-800/20 border border-zinc-800 prose prose-sm prose-invert break-words text-gray-300 p-4 rounded-md">
                <ReactMarkdown
                  components={{
                    h1: ({ ...props }) => <h1 className="text-lg font-bold mt-4 mb-2" {...props} />,
                    h2: ({ ...props }) => <h2 className="font-semibold mt-3 mb-1" {...props} />,
                    p: ({ ...props }) => <p className="text-xs leading-relaxed mb-2" {...props} />,
                    li: ({ ...props }) => <li className="list-disc list-inside mb-1" {...props} />,
                    code: ({ children, ...props }) =>
                        <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
                  }}
                  rehypePlugins={[rehypeRaw]}
                >
                  {snippet}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </CardContent>
    </Card>
    </Link>
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
      <div className="mb-2">
        <p className="text-sm text-gray-600">Click a card to view the full repository on GitHub.</p>
      </div>
      {searchResults.map((result: searchResult, i) => (
        <ResultCard key={result.id || result.name || i} result={result} />
      ))}
    </div>
  );
};
