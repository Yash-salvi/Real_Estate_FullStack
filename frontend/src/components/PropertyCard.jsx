import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Heart, MapPin, Maximize2, BedDouble } from 'lucide-react';

const PropertyCard = ({ property, isFavorited, onFavoriteToggle }) => {
  const { user } = useAuth();
  const isBuyer = user?.role === 'BUYER' || user?.role === 'ADMIN';

  // Format currency
  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getThumbnail = () => {
    if (property.imageUrls && property.imageUrls.length > 0) {
      const url = property.imageUrls[0];
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      return `http://localhost:8080${url}`;
    }
    // Fallback card image
    return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Property Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={getThumbnail()}
          alt={property.title}
          className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
        />
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide text-white shadow-sm ${
            property.type === 'SALE' ? 'bg-indigo-600' : 'bg-emerald-600'
          }`}>
            FOR {property.type}
          </span>
          {property.isBooked ? (
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold tracking-wide text-white shadow-sm flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
              Booked
            </span>
          ) : (
            <span className="rounded-full bg-slate-900/75 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold tracking-wide text-white shadow-sm">
              {property.status}
            </span>
          )}
          {property.isFeatured && (
            <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold tracking-wide text-white shadow-sm flex items-center gap-0.5">
              ★ Premium
            </span>
          )}
        </div>

        {/* Favorites Heart Button (Buyers only) */}
        {isBuyer && onFavoriteToggle && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onFavoriteToggle(property.id);
            }}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition hover:bg-white active:scale-95"
          >
            <Heart
              className={`h-4.5 w-4.5 transition-colors ${
                isFavorited
                  ? 'fill-red-500 text-red-500'
                  : 'text-slate-600 hover:text-red-500'
              }`}
            />
          </button>
        )}
      </div>

      {/* Property Information */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-bold tracking-tight text-brand-700">
            {formatPrice(property.price)}
            {property.type === 'RENT' && <span className="text-xs text-slate-500 font-normal"> / mo</span>}
          </span>
        </div>

        <h3 className="mt-2 text-md font-bold text-slate-900 line-clamp-1">
          <Link to={`/properties/${property.id}`} className="hover:text-brand-600">
            {property.title}
          </Link>
        </h3>

        <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="line-clamp-1">{property.address}, {property.city}</span>
        </div>

        {/* Feature Icons */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-slate-600">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <BedDouble className="h-4 w-4 text-slate-400" />
            <span>{property.bhk} BHK</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Maximize2 className="h-4 w-4 text-slate-400" />
            <span>{property.areaSqft.toLocaleString()} sqft</span>
          </div>
        </div>

        {/* View Details CTA */}
        <div className="mt-4 pt-1">
          <Link
            to={`/properties/${property.id}`}
            className="flex w-full items-center justify-center rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
