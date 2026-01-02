import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { formatPKR } from '@/lib/currency';

interface SearchResult {
  id: string;
  name: string;
  type: 'restaurant' | 'dish';
  category?: string;
  price?: number;
  restaurantId?: string;
  image?: string;
}

interface SearchAutocompleteProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

const SearchAutocomplete = ({ placeholder = "Search restaurants or dishes...", onSearch }: SearchAutocompleteProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Search functionality
  useEffect(() => {
    const searchItems = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        // Search restaurants
        const { data: restaurants } = await supabase
          .from('restaurants')
          .select('id, name, category, image')
          .eq('is_active', true)
          .ilike('name', `%${query}%`)
          .limit(5);

        // Search menu items
        const { data: menuItems } = await supabase
          .from('menu_items')
          .select('id, name, category, price, restaurant_id, image')
          .eq('is_available', true)
          .ilike('name', `%${query}%`)
          .limit(5);

        const combinedResults: SearchResult[] = [
          ...(restaurants || []).map(r => ({
            id: r.id,
            name: r.name,
            type: 'restaurant' as const,
            category: r.category,
            image: r.image,
          })),
          ...(menuItems || []).map(m => ({
            id: m.id,
            name: m.name,
            type: 'dish' as const,
            category: m.category,
            price: m.price,
            restaurantId: m.restaurant_id,
            image: m.image,
          })),
        ];

        setResults(combinedResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchItems, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    // Save to recent searches
    const newRecent = [result.name, ...recentSearches.filter(s => s !== result.name)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));

    if (result.type === 'restaurant') {
      navigate(`/restaurant/${result.id}`);
    } else if (result.restaurantId) {
      navigate(`/restaurant/${result.restaurantId}?item=${result.id}`);
    }
    setIsOpen(false);
    setQuery('');
  };

  const handleSearch = () => {
    if (query.trim()) {
      onSearch?.(query);
      navigate(`/restaurants?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  const trendingItems = ['Biryani', 'Zinger Burger', 'Nihari', 'Pizza', 'Karahi'];

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={placeholder}
          className="pl-12 pr-10 py-6 rounded-full border-2 bg-card focus:border-primary"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 left-0 right-0 bg-card rounded-2xl shadow-lg border border-border overflow-hidden z-50"
          >
            {loading && (
              <div className="p-4 text-center text-muted-foreground">
                Searching...
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="max-h-96 overflow-y-auto">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    {result.image && (
                      <img
                        src={result.image}
                        alt={result.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{result.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {result.type === 'restaurant' ? (
                          <span className="flex items-center gap-1">
                            🍽️ {result.category}
                          </span>
                        ) : (
                          <span>{formatPKR(result.price || 0)}</span>
                        )}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize bg-muted px-2 py-1 rounded-full">
                      {result.type}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {!loading && query.length < 2 && (
              <div className="p-4">
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Recent Searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search) => (
                        <button
                          key={search}
                          onClick={() => {
                            setQuery(search);
                            navigate(`/restaurants?search=${encodeURIComponent(search)}`);
                          }}
                          className="px-3 py-1 bg-muted rounded-full text-sm hover:bg-primary/10 transition-colors"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Trending in Karachi
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {trendingItems.map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          setQuery(item);
                          navigate(`/restaurants?search=${encodeURIComponent(item)}`);
                        }}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!loading && query.length >= 2 && results.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                No results found for "{query}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchAutocomplete;
