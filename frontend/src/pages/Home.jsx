import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import propertyService from '../services/propertyService';
import favoriteService from '../services/favoriteService';
import PropertyCard from '../components/PropertyCard';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Listings State
  const [properties, setProperties] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Favorites List (Array of property IDs)
  const [favorites, setFavorites] = useState([]);

  // Sidebar Filter Form State
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bhk, setBhk] = useState('');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');

  // Active filter params that are currently loaded
  const [activeFilters, setActiveFilters] = useState({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Load properties
  const fetchProperties = async (page = 0, filters = {}) => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 9,
        sortBy: 'createdAt',
        direction: 'desc',
        ...filters
      };
      
      // Clean empty parameters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const data = await propertyService.getProperties(params);
      setProperties(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error("Error fetching properties", error);
    } finally {
      setLoading(false);
    }
  };

  // Load favorites if user is Buyer
  const fetchFavorites = async () => {
    if (user && (user.role === 'BUYER' || user.role === 'ADMIN')) {
      try {
        const data = await favoriteService.getFavorites();
        setFavorites(data.map(item => item.id));
      } catch (error) {
        console.error("Error fetching favorites", error);
      }
    } else {
      setFavorites([]);
    }
  };

  useEffect(() => {
    fetchProperties(0, activeFilters);
  }, [activeFilters]);

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  // Handle Search Submission
  const handleSearch = (e) => {
    e.preventDefault();
    const newFilters = {
      city,
      type,
      minPrice,
      maxPrice,
      bhk,
      minArea,
      maxArea
    };
    setActiveFilters(newFilters);
    setCurrentPage(0);
    setShowMobileFilters(false);
  };

  // Clear Filters
  const handleClearFilters = () => {
    setCity('');
    setType('');
    setMinPrice('');
    setMaxPrice('');
    setBhk('');
    setMinArea('');
    setMaxArea('');
    setActiveFilters({});
    setCurrentPage(0);
    setShowMobileFilters(false);
  };

  // Pagination page click
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      fetchProperties(newPage, activeFilters);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle Favorites toggle clicked on card
  const handleFavoriteToggle = async (propertyId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const isAlreadyFavorited = favorites.includes(propertyId);
    try {
      if (isAlreadyFavorited) {
        await favoriteService.removeFavorite(propertyId);
        setFavorites(favorites.filter(id => id !== propertyId));
      } else {
        await favoriteService.addFavorite(propertyId);
        setFavorites([...favorites, propertyId]);
      }
    } catch (error) {
      console.error("Error toggling favorite", error);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Discover Properties</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Browse through {totalElements} available listings
        </p>
      </div>

      {/* Simplified Search & Filters Bar */}
      <form onSubmit={handleSearch} className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
          {/* City */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">City</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Search city..."
                className="block w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="block w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white"
            >
              <option value="">Any Type</option>
              <option value="SALE">For Sale</option>
              <option value="RENT">For Rent</option>
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Min Price</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min (₹)"
              className="block w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Max Price</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max (₹)"
              className="block w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-95 cursor-pointer"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition active:scale-95 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      </form>

      {/* Listings Grid */}
      <div className="mt-8">
        {loading ? (
          <div className="flex h-[300px] w-full items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="flex h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <Search className="h-10 w-10 text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No Listings Found</h3>
            <p className="mt-1 text-sm text-slate-500">Try modifying your search criteria or clearing filters.</p>
            <button
              onClick={handleClearFilters}
              className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              Clear Search Filters
            </button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isFavorited={favorites.includes(property.id)}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-3">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-40 active:scale-95"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <span className="text-sm font-semibold text-slate-700">
                  Page {currentPage + 1} of {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-40 active:scale-95"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
