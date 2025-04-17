'use client';

import {useSearchStore} from "@/hooks/searchStore";
import {useParams} from "next/navigation";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {ArrowLeft, Star, ExternalLink} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function ViewPage() {
  const {name} = useParams();
  const {searchResults} = useSearchStore();
  const router = useRouter();

  const result = searchResults.find(r => r.name === decodeURIComponent(name as string));

  if (!result) {
    return <div>Content not found</div>;
  }

  return <div className="w-full h-screen p-4 bg-background">
    <div className="relative w-full mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl mx-auto font-bold">{result.name}</h1>
        <Button className="absolute left-0" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      <div className="w-full max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Owner:</span>
            <span>{result.owner || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span>{result.stars?.toLocaleString() || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Language:</span>
            <span>{result.language || 'Not specified'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Readme:</span>
            {result.readmeUrl ? (
              <Link
                href={result.readmeUrl}
                target="_blank"
                className="flex items-center gap-1 text-blue-500 hover:underline"
              >
                View <ExternalLink className="h-3 w-3" />
              </Link>
            ) : 'Not available'}
          </div>
        </div>

        {result.summary && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({...props}) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
                  h2: ({...props}) => <h2 className="text-lg font-semibold mt-3 mb-1" {...props} />,
                  p: ({...props}) => <p className="text-sm leading-relaxed mb-2" {...props} />,
                  li: ({...props}) => <li className="list-disc list-inside" {...props} />,
                  code: ({...props}) => (
                    <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props} />
                  ),
                }}
              >
                {result.summary}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>;
}
