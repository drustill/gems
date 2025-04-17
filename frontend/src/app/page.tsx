'use client';
import { Input } from "@/components/ui/input"
import { useSearchStore } from "@/hooks/searchStore"
import { Button } from "@/components/ui/button"
import { SearchResults } from "@/components/ui/searchResults";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {useEffect, useState} from "react";


export default function Home() {

  const {searchResults, searchText, setSearchText, runSearch, isLoading, languages, selectedLanguage, setSelectedLanguage, suggestions, setSuggestions, isLoadingSuggestion, loadLanguages} = useSearchStore()
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    setIsInputFocused(false)
    e.preventDefault();
    console.time('[query]')
    await runSearch();
    console.timeEnd('[query]')
  }
  useEffect(()=> {
   loadLanguages()
  },[])

  return <div className={`w-full min-h-screen p-4 bg-background ${searchResults.length > 0 ? "":"flex justify-center items-center"}`}>
    <div className="w-full flex flex-col gap-10 justify-center items-center">
      <div className="text-2xl font-bold">Repository Search</div>
      <form onSubmit={handleSubmit} className="relative w-3/4 flex flex-col md:flex-row gap-2">
      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Programming Language</SelectLabel>
            <SelectItem key={'All'} value={'All'}>All</SelectItem>
            {languages.map((lang) => (
              <SelectItem key={lang} value={lang}>{lang}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
        <div className="relative flex-[9]">
          <Input
            className={"h-10 pl-10 w-full relative"}
            placeholder="Search repositories..."
            value={searchText}
            onChange={(e) => {setSearchText(e.target.value); setSuggestions()}}
            disabled={isLoading}
            onFocus={() => setIsInputFocused(true)}
            // onBlur={() => setIsInputFocused(false)}
          />
          {isInputFocused && (suggestions.length > 0 || isLoadingSuggestion) && (
        <ul className="absolute left-0 top-full w-full border   text-white rounded-md shadow-md">
          {isLoadingSuggestion && <li className={"w-full flex items-center  justify-center"}>
            <svg aria-hidden="true" className="w-8 h-8 text-white animate-spin dark:text-gray-600 fill-primary"
                 viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"/>
              <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"/>
            </svg>
          </li>}
          {suggestions.map((suggestion, i) => (
              <li
                  key={suggestion}
                  onClick={() => {
                    setSearchText(suggestion);
                    setSuggestions();
                  }}
                  className={`px-4 py-2  bg-primary border-b hover:opacity-80 cursor-pointer ${i === suggestions.length -1? 'rounded-b-md border-none border-b':""}`}
              >
                {suggestion}
              </li>
          ))}
        </ul>
          )}

          {/* Search Icon */}
          <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
          >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
        <Button type="submit" className="h-10 w-full md:w-auto mt-2 md:mt-0" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </form>
      {/* Search Results section */}
      {searchResults.length > 0 && <SearchResults />}
    </div>
  </div>
}
