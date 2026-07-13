import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import propertyService from '../services/propertyService';
import enquiryService from '../services/enquiryService';
import paymentService from '../services/paymentService';
import { Plus, Edit, Trash2, UploadCloud, Check, Mail, Phone, User, MapPin, FileText, X, AlertCircle, Sparkles } from 'lucide-react';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('listings'); // listings / enquiries

  // Data State
  const [listings, setListings] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingEnquiries, setLoadingEnquiries] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Modal / Form State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState(null);

  // Property Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('SALE');
  const [bhk, setBhk] = useState(1);
  const [areaSqft, setAreaSqft] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [status, setStatus] = useState('AVAILABLE');

  // Image Upload State
  const [uploadingId, setUploadingId] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [imageError, setImageError] = useState(null);

  // Fetch agent listings
  const fetchListings = async () => {
    setLoadingListings(true);
    try {
      const data = await propertyService.getMyListings({ size: 50 });
      setListings(data.content || []);
    } catch (error) {
      console.error("Error loading agent listings", error);
    } finally {
      setLoadingListings(false);
    }
  };

  const [featuringLoading, setFeaturingLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleFeatureProperty = async (propertyId, propertyTitle) => {
    setFeaturingLoading(true);
    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert("Razorpay SDK failed to load. Please check your internet connection.");
        setFeaturingLoading(false);
        return;
      }

      const orderData = await paymentService.createOrder(propertyId, "PREMIUM");
      
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Plotify Estates",
        description: `Premium Feature Fee for ${propertyTitle}`,
        image: "https://unpkg.com/lucide-static@0.24.0/icons/home.svg",
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            await paymentService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            alert("Success! Your property is now featured at the top of search results.");
            fetchListings();
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
          `[TEST SANDBOX MODE]\n\nDo you want to simulate a successful payment of ₹1,000 to feature: "${propertyTitle}"?`
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
            alert("Success! Your property is now featured at the top of search results.");
            fetchListings();
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
      alert("Error initiating premium listing payment: " + (err.response?.data?.message || err.message));
    } finally {
      setFeaturingLoading(false);
    }
  };

  // Fetch enquiries
  const fetchEnquiries = async () => {
    setLoadingEnquiries(true);
    try {
      const data = await enquiryService.getAgentEnquiries();
      setEnquiries(data || []);
    } catch (error) {
      console.error("Error loading agent enquiries", error);
    } finally {
      setLoadingEnquiries(false);
    }
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const response = await paymentService.getAgentBookings();
      setBookings(response || []);
    } catch (error) {
      console.error("Error loading agent bookings", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchListings();
    fetchEnquiries();
    fetchBookings();
  }, []);

  // Open Form for Create
  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setType('SALE');
    setBhk(1);
    setAreaSqft('');
    setCity('');
    setAddress('');
    setLatitude('');
    setLongitude('');
    setStatus('AVAILABLE');
    setFormError(null);
    setShowFormModal(true);
  };

  // Open Form for Edit
  const handleOpenEdit = (property) => {
    setEditingId(property.id);
    setTitle(property.title);
    setDescription(property.description);
    setPrice(property.price);
    setType(property.type);
    setBhk(property.bhk);
    setAreaSqft(property.areaSqft);
    setCity(property.city);
    setAddress(property.address);
    setLatitude(property.latitude || '');
    setLongitude(property.longitude || '');
    setStatus(property.status);
    setFormError(null);
    setShowFormModal(true);
  };

  // Submit property form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    
    const propertyData = {
      title,
      description,
      price: parseFloat(price),
      type,
      bhk: parseInt(bhk),
      areaSqft: parseInt(areaSqft),
      city,
      address,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      status
    };

    try {
      if (editingId) {
        await propertyService.updateProperty(editingId, propertyData);
      } else {
        await propertyService.createProperty(propertyData);
      }
      setShowFormModal(false);
      fetchListings();
    } catch (error) {
      console.error("Error submitting property", error);
      setFormError(error.message || "Failed to submit property. Check constraints.");
    }
  };

  // Delete property
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      try {
        await propertyService.deleteProperty(id);
        fetchListings();
      } catch (error) {
        console.error("Error deleting property", error);
        alert(error.message || "Failed to delete property.");
      }
    }
  };

  // Open image uploader modal
  const handleOpenUpload = (id) => {
    setUploadingId(id);
    setImageError(null);
    setShowUploadModal(true);
  };

  // Upload image handler
  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadingId) return;

    setImageError(null);
    try {
      await propertyService.uploadImage(uploadingId, file);
      setShowUploadModal(false);
      setUploadingId(null);
      fetchListings();
    } catch (error) {
      console.error("Image upload failed", error);
      setImageError(error.message || "Failed to upload image. Please try again.");
    }
  };

  // Respond to enquiry
  const handleRespondEnquiry = async (enquiryId) => {
    try {
      await enquiryService.respondToEnquiry(enquiryId, 'RESPONDED');
      fetchEnquiries();
    } catch (error) {
      console.error("Error responding to enquiry", error);
      alert("Failed to respond to enquiry.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Agent Control Panel</h1>
          <p className="mt-1 text-sm text-slate-500">Manage listings, upload images, and review buyer inquiries</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 active:scale-95 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create Listing</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-4 px-6 text-sm font-bold border-b-2 transition ${
            activeTab === 'listings'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          My Listings ({listings.length})
        </button>
        <button
          onClick={() => setActiveTab('enquiries')}
          className={`pb-4 px-6 text-sm font-bold border-b-2 transition ${
            activeTab === 'enquiries'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Received Enquiries ({enquiries.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-4 px-6 text-sm font-bold border-b-2 transition ${
            activeTab === 'bookings'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Locked Bookings ({bookings.length})
        </button>
      </div>

      <div className="mt-8">
        {/* LISTINGS TAB */}
        {activeTab === 'listings' && (
          <div>
            {loadingListings ? (
              <div className="flex h-[200px] w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600"></div>
              </div>
            ) : listings.length === 0 ? (
              <div className="flex h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <FileText className="h-10 w-10 text-slate-300 mb-3" />
                <h3 className="text-lg font-bold text-slate-700">No Listings Added Yet</h3>
                <p className="mt-1 text-sm text-slate-500">Create your first property listing to get started.</p>
                <button
                  onClick={handleOpenCreate}
                  className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  List a Property
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-55 bg-slate-50/75">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Property</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Price</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Images</th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {listings.map((property) => (
                      <tr key={property.id} className="hover:bg-slate-50/50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-14 overflow-hidden rounded-md bg-slate-100 border">
                              <img
                                src={property.imageUrls && property.imageUrls.length > 0 ? `http://localhost:8080${property.imageUrls[0]}` : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=150&q=80'}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{property.title}</span>
                                {property.isFeatured && (
                                  <span className="rounded bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                                    Premium
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-0.5">
                                <MapPin className="h-3 w-3" />
                                <span>{property.city}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-xs font-semibold text-slate-700">
                          {property.type}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-brand-700">
                          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(property.price)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            property.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {property.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500">
                          {property.imageUrls?.length || 0} upload(s)
                        </td>
                         <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                          <div className="flex justify-end gap-2">
                            {!property.isFeatured && (
                              <button
                                onClick={() => handleFeatureProperty(property.id, property.title)}
                                disabled={featuringLoading}
                                className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-100 disabled:opacity-50"
                                title="Feature Listing (₹1,000)"
                              >
                                <Sparkles className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenUpload(property.id)}
                              className="flex items-center gap-1 rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                              title="Upload Image"
                            >
                              <UploadCloud className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(property)}
                              className="flex items-center gap-1 rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                              title="Edit Listing"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(property.id)}
                              className="flex items-center gap-1 rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-red-50 hover:text-red-600"
                              title="Delete Listing"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                <h3 className="text-lg font-bold text-slate-700">No Enquiries Received</h3>
                <p className="mt-1 text-sm text-slate-500">Queries submitted by buyers on your listings will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {enquiries.map((enquiry) => (
                  <div key={enquiry.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow transition">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-4">
                      <div>
                        <div className="text-xs font-semibold text-slate-400">Buyer Profile</div>
                        <h4 className="text-md font-bold text-slate-800 flex items-center gap-1">
                          <User className="h-4 w-4 text-slate-400" />
                          <span>{enquiry.buyer?.name}</span>
                        </h4>
                        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span>{enquiry.buyer?.email}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span>{enquiry.buyer?.phone}</span>
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-0 flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          enquiry.status === 'PENDING' ? 'bg-amber-55 bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {enquiry.status}
                        </span>
                        {enquiry.status === 'PENDING' && (
                          <button
                            onClick={() => handleRespondEnquiry(enquiry.id)}
                            className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Mark Responded</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs font-semibold text-slate-400">Property Listing Context</div>
                      <div className="text-sm font-bold text-slate-850 mt-0.5 text-slate-800">
                        {enquiry.propertyTitle} (Listing ID: #{enquiry.propertyId})
                      </div>
                      
                      <div className="text-xs font-semibold text-slate-400 mt-4">Buyer's Message</div>
                      <p className="mt-1 text-sm bg-slate-50/75 p-3 rounded-lg border border-slate-100 text-slate-600 leading-relaxed italic">
                        "{enquiry.message}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            {loadingBookings ? (
              <div className="flex h-[200px] w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="flex h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <Check className="h-10 w-10 text-slate-300 mb-3" />
                <h3 className="text-lg font-bold text-slate-700">No Locked Properties</h3>
                <p className="mt-1 text-sm text-slate-500">None of your properties have been booked by buyers yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-3">Property</th>
                      <th className="px-6 py-3">Locked By (Buyer)</th>
                      <th className="px-6 py-3">Contact</th>
                      <th className="px-6 py-3">Token Paid</th>
                      <th className="px-6 py-3">Booking Date</th>
                      <th className="px-6 py-3">Transaction ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                    {bookings.map((booking) => (
                      <tr key={booking.paymentId} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-slate-900">
                          <Link to={`/properties/${booking.propertyId}`} className="hover:text-brand-600">
                            {booking.propertyTitle}
                          </Link>
                        </td>
                        <td className="px-6 py-4 font-semibold">{booking.buyerName}</td>
                        <td className="px-6 py-4 space-y-0.5 text-xs text-slate-500">
                          <div>✉ {booking.buyerEmail}</div>
                          <div>📞 {booking.buyerPhone}</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-brand-700">
                          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(booking.amount)}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {new Date(booking.bookingDate).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">{booking.paymentId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CREATE & EDIT FORM MODAL */}
      {showFormModal && (
        <div className="relative z-50">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowFormModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowFormModal(false)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-xl font-bold text-slate-900 border-b pb-3">
                {editingId ? 'Edit Property Listing' : 'List a New Property'}
              </h2>

              {formError && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form className="mt-5 space-y-4" onSubmit={handleFormSubmit}>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Property Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Spacious 3 BHK Apartment in Midtown"
                    className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">Description</label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe amenities, proximity to transit, conditions..."
                    className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Transaction Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 bg-white"
                    >
                      <option value="SALE">For Sale</option>
                      <option value="RENT">For Rent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Listing Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 bg-white"
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="SOLD">Sold</option>
                      <option value="RENTED">Rented</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 350000"
                      className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">BHK bedrooms</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={bhk}
                      onChange={(e) => setBhk(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Area (Sqft)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={areaSqft}
                      onChange={(e) => setAreaSqft(e.target.value)}
                      placeholder="e.g. 1500"
                      className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Austin"
                      className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Street Address</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 456 Congress Ave"
                      className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t pt-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Latitude (for Maps)</label>
                    <input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="e.g. 30.2672"
                      className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Longitude (for Maps)</label>
                    <input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="e.g. -97.7431"
                      className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 active:scale-95"
                  >
                    {editingId ? 'Save Changes' : 'Publish Listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE UPLOAD MODAL */}
      {showUploadModal && (
        <div className="relative z-50">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowUploadModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-xl font-bold text-slate-900 border-b pb-3">Upload Listing Image</h2>
              
              {imageError && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-xs text-red-700">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{imageError}</span>
                </div>
              )}

              <div className="mt-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-350 rounded-2xl border-slate-300 p-8 bg-slate-50 hover:bg-slate-100/50 transition relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="h-10 w-10 text-slate-400 mb-2" />
                <span className="text-sm font-semibold text-slate-700">Choose Image File</span>
                <span className="text-xs text-slate-400 mt-1">PNG, JPG, JPEG up to 10MB</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
