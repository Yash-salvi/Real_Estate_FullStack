import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import favoriteService from '../services/favoriteService';
import enquiryService from '../services/enquiryService';
import paymentService from '../services/paymentService';
import PropertyCard from '../components/PropertyCard';
import { Bookmark, Mail, FileText, Calendar, ChevronRight } from 'lucide-react';

const BuyerDashboard = () => {
  const [activeTab, setActiveTab] = useState('favorites'); // favorites / enquiries

  // Data State
  const [favorites, setFavorites] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [loadingEnquiries, setLoadingEnquiries] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const fetchFavorites = async () => {
    setLoadingFavorites(true);
    try {
      const data = await favoriteService.getFavorites();
      setFavorites(data || []);
    } catch (error) {
      console.error("Error loading buyer favorites", error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const fetchEnquiries = async () => {
    setLoadingEnquiries(true);
    try {
      const data = await enquiryService.getMyEnquiries();
      setEnquiries(data || []);
    } catch (error) {
      console.error("Error loading buyer enquiries", error);
    } finally {
      setLoadingEnquiries(false);
    }
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const data = await paymentService.getMyBookings();
      setBookings(data || []);
    } catch (error) {
      console.error("Error loading buyer bookings", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
    fetchEnquiries();
    fetchBookings();
  }, []);

  // Remove favorite from dashboard directly
  const handleFavoriteToggle = async (propertyId) => {
    try {
      await favoriteService.removeFavorite(propertyId);
      setFavorites(favorites.filter(item => item.id !== propertyId));
    } catch (error) {
      console.error("Error removing bookmark", error);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Buyer Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Track bookmarked listings and review sent property inquiries</p>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`pb-4 px-6 text-sm font-bold border-b-2 transition ${
            activeTab === 'favorites'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Bookmarked Properties ({favorites.length})
        </button>
        <button
          onClick={() => setActiveTab('enquiries')}
          className={`pb-4 px-6 text-sm font-bold border-b-2 transition ${
            activeTab === 'enquiries'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          My Sent Enquiries ({enquiries.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-4 px-6 text-sm font-bold border-b-2 transition ${
            activeTab === 'bookings'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          My Bookings ({bookings.length})
        </button>
      </div>

      <div className="mt-8">
        {/* FAVORITES TAB */}
        {activeTab === 'favorites' && (
          <div>
            {loadingFavorites ? (
              <div className="flex h-[200px] w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600"></div>
              </div>
            ) : favorites.length === 0 ? (
              <div className="flex h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-305 border-slate-350 border-slate-300 bg-white p-8 text-center">
                <Bookmark className="h-10 w-10 text-slate-300 mb-3" />
                <h3 className="text-lg font-bold text-slate-700">No Saved Properties</h3>
                <p className="mt-1 text-sm text-slate-500">Bookmark listings to view them here later.</p>
                <Link
                  to="/"
                  className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700"
                >
                  Explore Listings
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {favorites.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isFavorited={true}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ENQUIRIES TAB */}
        {activeTab === 'enquiries' && (
          <div>
            {loadingEnquiries ? (
              <div className="flex h-[200px] w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600"></div>
              </div>
            ) : enquiries.length === 0 ? (
              <div className="flex h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <Mail className="h-10 w-10 text-slate-300 mb-3" />
                <h3 className="text-lg font-bold text-slate-700">No Sent Enquiries</h3>
                <p className="mt-1 text-sm text-slate-500">Any questions submitted on property listings will show up here.</p>
                <Link
                  to="/"
                  className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700"
                >
                  Find Properties
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Property Listing</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Message Context</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date Sent</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Agent Status</th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {enquiries.map((enquiry) => (
                      <tr key={enquiry.id} className="hover:bg-slate-50/50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-bold text-slate-900">{enquiry.propertyTitle}</div>
                          <div className="text-xs text-slate-400">ID: #{enquiry.propertyId}</div>
                        </td>
                        <td className="px-6 py-4 max-w-xs text-sm text-slate-600 italic truncate">
                          "{enquiry.message}"
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500 flex items-center gap-1 mt-1 border-none">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formatDate(enquiry.createdAt)}</span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            enquiry.status === 'PENDING' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {enquiry.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                          <Link
                            to={`/properties/${enquiry.propertyId}`}
                            className="inline-flex items-center gap-0.5 text-brand-600 hover:text-brand-700 font-semibold"
                          >
                            <span>View</span>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div>
            {loadingBookings ? (
              <div className="flex h-[200px] w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="flex h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <Bookmark className="h-10 w-10 text-slate-300 mb-3" />
                <h3 className="text-lg font-bold text-slate-700">No Booked Properties</h3>
                <p className="mt-1 text-sm text-slate-500">You have not locked or booked any properties yet.</p>
                <Link
                  to="/"
                  className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700"
                >
                  Explore Properties
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {bookings.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isFavorited={favorites.some(fav => fav.id === property.id)}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
