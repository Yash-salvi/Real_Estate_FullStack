import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import propertyService from '../services/propertyService';
import enquiryService from '../services/enquiryService';
import favoriteService from '../services/favoriteService';
import paymentService from '../services/paymentService';
import MapComponent from '../components/MapComponent';
import { BedDouble, Maximize2, MapPin, Phone, Mail, User, Send, Heart, ChevronLeft, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carousel State
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Enquiry Form State
  const [message, setMessage] = useState('');
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryError, setEnquiryError] = useState(null);

  // Favorite State
  const [isFavorited, setIsFavorited] = useState(false);

  // Booking State
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchProperty = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await propertyService.getProperty(id);
      setProperty(data);
      
      // Load favorite status if user is buyer
      if (user && (user.role === 'BUYER' || user.role === 'ADMIN')) {
        const favStatus = await favoriteService.isFavorite(id);
        setIsFavorited(favStatus);
      }
    } catch (err) {
      console.error(err);
      setError("Property could not be loaded. It may have been deleted.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [id, user]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const getBookingAmount = () => {
    if (!property) return 0;
    if (property.type === 'RENT') {
      return property.price < 50000 ? 2000 : 3000;
    } else {
      return property.price < 20000000 ? 10000 : 12000;
    }
  };

  const handleBookProperty = async () => {
    setBookingLoading(true);
    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert("Razorpay SDK failed to load. Please check your internet connection.");
        setBookingLoading(false);
        return;
      }

      const orderData = await paymentService.createOrder(property.id, "BOOKING");
      const bookingAmount = getBookingAmount();
      
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Plotify Estates",
        description: `Token Booking for ${property.title} (${formatPrice(bookingAmount)})`,
        image: "https://unpkg.com/lucide-static@0.24.0/icons/home.svg",
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            await paymentService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            alert("Congratulations! Property booked successfully and is now locked.");
            fetchProperty();
          } catch (err) {
            console.error("Verification failed", err);
            alert("Payment verification failed: " + (err.response?.data?.message || err.message));
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        theme: {
          color: "#4f46e5"
        }
      };

      if (orderData.isMock) {
        const confirmPayment = window.confirm(
          `[TEST SANDBOX MODE]\n\nDo you want to simulate a successful payment of ${formatPrice(bookingAmount)} to book: "${property.title}"?`
        );
        if (confirmPayment) {
          const mockPaymentId = "pay_mock_" + Math.random().toString(36).substring(2, 10);
          const mockSignature = "mock_sig_" + mockPaymentId;
          try {
            await paymentService.verifyPayment({
              razorpayOrderId: orderData.orderId,
              razorpayPaymentId: mockPaymentId,
              razorpaySignature: mockSignature
            });
            alert("Congratulations! Property booked successfully and is now locked.");
            fetchProperty();
          } catch (err) {
            alert("Verification failed: " + (err.response?.data?.message || err.message));
          }
        }
      } else {
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      console.error(err);
      alert("Error initiating booking: " + (err.response?.data?.message || err.message));
    } finally {
      setBookingLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) return;
    try {
      if (isFavorited) {
        await favoriteService.removeFavorite(property.id);
        setIsFavorited(false);
      } else {
        await favoriteService.addFavorite(property.id);
        setIsFavorited(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setEnquiryLoading(true);
    setEnquiryError(null);
    setEnquirySuccess(false);

    try {
      await enquiryService.createEnquiry(property.id, message);
      setEnquirySuccess(true);
      setMessage('');
    } catch (err) {
      console.error(err);
      setEnquiryError(err.message || "Failed to submit enquiry. Please try again.");
    } finally {
      setEnquiryLoading(false);
    }
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex h-[450px] w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Oops, Listing Not Found</h2>
        <p className="mt-2 text-slate-500">{error || "The property listing you are trying to access does not exist."}</p>
        <Link to="/" className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-brand-700">
          Back to Listings
        </Link>
      </div>
    );
  }

  const imagesList = property.imageUrls && property.imageUrls.length > 0
    ? property.imageUrls.map(url => (url.startsWith('http://') || url.startsWith('https://') ? url : `http://localhost:8080${url}`))
    : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'];

  const prevImage = () => {
    setActiveImageIndex(prev => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setActiveImageIndex(prev => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-50">
      {/* Back button */}
      <div className="mb-6">
        <Link to="/" className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition">
          &larr; Back to Listings
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Images Carousel & Details (2 columns) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Custom Carousel */}
          <div className="group relative aspect-[16/9] overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-md">
            <img
              src={imagesList[activeImageIndex]}
              alt={`Property ${activeImageIndex + 1}`}
              className="h-full w-full object-contain"
            />
            
            {/* Arrows */}
            {imagesList.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/65 p-2 text-white transition hover:bg-slate-900 active:scale-90"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/65 p-2 text-white transition hover:bg-slate-900 active:scale-90"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Indicator Dot Badges */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 rounded-full bg-slate-900/60 px-3 py-1.5">
              {imagesList.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    activeImageIndex === index ? 'bg-white w-4' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Description & Overview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">About this property</h2>
            <p className="mt-4 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Location Map */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Location Map</h2>
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin className="h-4.5 w-4.5 text-slate-400" />
              <span>{property.address}, {property.city}</span>
            </div>
            {/* Render interactive Leaflet Map */}
            <MapComponent
              latitude={property.latitude}
              longitude={property.longitude}
              title={property.title}
              address={property.address}
            />
          </div>
        </div>

        {/* Pricing, Specifications & Enquiry Sidebar (1 column) */}
        <div className="space-y-6">
          {/* Highlights Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide text-white ${
                property.type === 'SALE' ? 'bg-indigo-600' : 'bg-emerald-600'
              }`}>
                FOR {property.type}
              </span>
              {user && (user.role === 'BUYER' || user.role === 'ADMIN') && (
                <button
                  onClick={handleFavoriteToggle}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-red-500"
                >
                  <Heart className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
              )}
            </div>

            <h1 className="mt-3 text-2xl font-extrabold text-slate-900">{property.title}</h1>
            
            <div className="mt-4 text-3xl font-extrabold text-brand-700">
              {formatPrice(property.price)}
              {property.type === 'RENT' && <span className="text-sm text-slate-500 font-normal"> / mo</span>}
            </div>

            {/* Spec grid */}
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-4 text-slate-600">
              <div className="flex items-center gap-2">
                <BedDouble className="h-5 w-5 text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Bedrooms</span>
                  <span className="text-sm font-bold text-slate-800">{property.bhk} BHK</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Maximize2 className="h-5 w-5 text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Size</span>
                  <span className="text-sm font-bold text-slate-800">{property.areaSqft.toLocaleString()} sqft</span>
                </div>
              </div>
            </div>

            {/* Agent / Contact details */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Listed by Agent</div>
                <div className="text-sm font-bold text-slate-800">{property.agent?.name || "Independent Agent"}</div>
              </div>
            </div>
            
            <div className="mt-4 space-y-2 text-xs text-slate-500 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{property.agent?.phone || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>{property.agent?.email || "N/A"}</span>
              </div>
            </div>

            {/* Booking Action */}
            {property.isBooked ? (
              <div className="mt-6 w-full rounded-lg bg-red-50 border border-red-200 py-3 text-center text-sm font-bold text-red-700 shadow-sm flex items-center justify-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                <span>Locked / Booked</span>
              </div>
            ) : (
              user && (user.role === 'BUYER' || user.role === 'ADMIN') && (
                <button
                  onClick={handleBookProperty}
                  disabled={bookingLoading}
                  className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {bookingLoading ? 'Processing Booking...' : `Book Property (Lock with ${formatPrice(getBookingAmount())})`}
                </button>
              )
            )}
          </div>

          {/* Enquiry Form Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Enquire about this listing</h3>
            
            {enquirySuccess && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-4 text-xs text-emerald-700">
                <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                <span>Your enquiry was submitted successfully! The agent will review your enquiry.</span>
              </div>
            )}

            {enquiryError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-xs text-red-700">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{enquiryError}</span>
              </div>
            )}

            {!user ? (
              <div className="mt-4 rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">
                Please{' '}
                <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 transition">
                  sign in as a Buyer
                </Link>{' '}
                to submit queries directly to this agent.
              </div>
            ) : user.role === 'AGENT' ? (
              <div className="mt-4 rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">
                You are registered as an Agent. Enquiry submission is reserved for Buyers.
              </div>
            ) : (
              <form className="mt-4 space-y-3" onSubmit={handleEnquirySubmit}>
                <div>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Hello, I am interested in this listing. Please contact me."
                    className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={enquiryLoading || !message.trim()}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700 disabled:opacity-50 active:scale-95 transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{enquiryLoading ? 'Sending...' : 'Send Enquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
