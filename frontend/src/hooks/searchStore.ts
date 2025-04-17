import { create } from "zustand"

export type searchResult = {
    name: string
    description: string
    url: string
    similarity: number
    owner?: string
    stars?: number
    language?: string | null
    readmeUrl?: string
    summary?: string
    contents?: string
    distance: number 
}

interface searchStore {
    searchText: string,
    searchResults: searchResult[]
    setSearchText: (searchText: string) => void
    runSearch: () => Promise<void>

    isLoadingSuggestion:boolean,

    languages:string[],

    isLoading: boolean,

    suggestions:string[],
    setSuggestions:() =>  Promise<void>,

    selectedLanguage: string,
    setSelectedLanguage: (language: string) => void
    loadLanguages: () => void

}
export const useSearchStore = create<searchStore>((set, get) => ({
    searchText: "",
    searchResults: [],
    isLoading: false,
    isLoadingSuggestion: false,

    loadLanguages: async () => {
        const languages: {languages:string[]} = await (await fetch("/api/languages")).json()
        set({languages:languages.languages.filter(Boolean)})
    },
    suggestions: [],
    setSuggestions: async () => {
        if(get().suggestions.includes(get().searchText)){
            set({suggestions:[]})
            return
        }
        set({isLoadingSuggestion:true})
        set({suggestions:[]})
        if (get().searchText === ""){
            set({isLoadingSuggestion:false})
            return;
        }
       const body = {question:get().searchText}
        const res = await fetch("/api/suggestions", {
            method:"POST",
            headers:{
                'Content-Type': 'application/json'
            },
            body:JSON.stringify(body)
        })
        const json = await res.json()
        set({suggestions:json.suggestions, isLoadingSuggestion: false})
    },

    selectedLanguage: "",


    setSelectedLanguage: (language) => set({selectedLanguage: language}),
    languages:['c++', 'c#', 'java', 'kotlin', 'python', 'c', 'rust','go','typescript', 'javascript','ruby','php'],
    setSearchText: (searchText: string) => set({ searchText }),
    runSearch: async () => {
        try {
            set({ isLoading: true });
            const language = get().selectedLanguage
            const body = JSON.stringify({ query: get().searchText, language: language === 'All' ? undefined : language })
            const response = await fetch('/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body,
            });


            if (!response.ok) {
                throw new Error('Search request failed');
            }

            const {res} = await response.json();
            console.log('response query response ', res)
            set({ searchResults: res, isLoading: false });
        } catch (error) {
            console.error('Search error:', error);
            set({ isLoading: false });
        }
    }
}))