'use client';

import { searchResult, useSearchStore } from "@/hooks/searchStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export const SearchResults = () => {
    const { searchResults, isLoading } = useSearchStore();
    
    if (isLoading) {
        return (
            <div className="w-3/4 flex justify-center">
                <div className="text-lg">Loading results...</div>
            </div>
        );
    }
    
    return (
        <div className="w-3/4 flex flex-col gap-4">
            <div className="text-2xl font-bold">Search Results</div>
            {searchResults.map((result: searchResult, i) => (
                <Card 
                    key={result.name || i} 
                    className="hover:shadow-md transition-all"
                >
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Link href={`/view/${encodeURIComponent(result.name)}`} className="hover:underline">
                                    {result.name}
                                </Link>
                                <Badge variant="outline" className="ml-2">
                                    {(100 - (result.distance * 100)).toFixed(2)} % match
                                </Badge>
                            </CardTitle>
                            {result.url && (
                                <CardDescription className="mt-1">
                                    <Link href={result.url.replace('raw.githubusercontent', 'github').split('/').slice(0, -2).join('/')} target="_blank" className="flex items-center gap-1 text-blue-500 hover:underline">
                                        Visit Repository <ExternalLink size={14} />
                                    </Link>
                                </CardDescription>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {result.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}