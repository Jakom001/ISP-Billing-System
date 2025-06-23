import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useEnterpriseContext } from '../../context/EnterpriseContext';

const UpdateEnterprise = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { updateEnterprise, getSingleEnterprise, loading, error, clearError } = useEnterpriseContext();
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    industry: '',
    website: '',
    noStaff: '',
    yearsExistence: '',
    email: '',
    phone: '',
    city: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [fetchLoading, setFetchLoading] = useState(true);

  // Fetch the enterprise data when component mounts
  useEffect(() => {
    const fetchEnterprise = async () => {
      setFetchLoading(true);
      const result = await getSingleEnterprise(id);
      
      if (result.data) {
        const enterprise = result.data;
        setFormData({
          name: enterprise.name || '',
          address: enterprise.address || '',
          industry: enterprise.industry || '',
          website: enterprise.website || '',
          noStaff: enterprise.noStaff || '',
          yearsExistence: enterprise.yearsExistence || '',
          email: enterprise.email || '',
          phone: enterprise.phone || '',
          city: enterprise.city || '',
          description: enterprise.description || ''
        });
      } else {
        toast.error("Enterprise not found", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate('/enterprises', { replace: true });
      }
      setFetchLoading(false);
    };

    fetchEnterprise();
  }, [id, getSingleEnterprise, navigate]);

  const validateForm = () => {
    let newErrors = {};
    
    // Required field validations
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      // Email format validation
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    // Number field validations
    if (formData.noStaff && (isNaN(formData.noStaff) || formData.noStaff < 0)) {
      newErrors.noStaff = "Number of staff must be a positive number";
    }

    if (formData.yearsExistence && (isNaN(formData.yearsExistence) || formData.yearsExistence < 0)) {
      newErrors.yearsExistence = "Years of existence must be a positive number";
    }

    // Website URL validation (if provided)
    if (formData.website && formData.website.trim()) {
      const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlRegex.test(formData.website)) {
        newErrors.website = "Please enter a valid website URL";
      }
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));

    // Clear field-specific error when user types
    if (formErrors[name]) {
      setFormErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
    }
    
    // Clear global API error
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please correct the errors highlighted below", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    
    // Convert number fields to numbers before submitting
    const submitData = {
      ...formData,
      noStaff: formData.noStaff ? Number(formData.noStaff) : undefined,
      yearsExistence: formData.yearsExistence ? Number(formData.yearsExistence) : undefined,
    };
    
    const result = await updateEnterprise(id, submitData);

    if (result.data) {
      toast.success(result.success || "Enterprise updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/enterprises');
      }, 2000);
    } else if (result.error) {
      toast.error(result.error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };
  return (
      <div className='mx-auto max-w-4xl px-4 py-8 bg-gray-50 min-h-screen'>
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <h1 className='text-3xl font-bold text-white text-center'>Update Enterprise</h1> 
            <p className="text-green-100 text-center mt-2">Modify the enterprise information below</p>
          </div>
  
          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              {/* Basic Information Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-gray-200">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Enterprise Name */}
                  <div className="mb-6 flex flex-col">
                    <label className="text-left text-sm font-semibold text-gray-700 mb-2">
                      Enterprise Name
                      <span className='text-red-500 font-bold ml-1'>*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter enterprise name"
                      className={`w-full px-4 py-3 border-2 ${
                        formErrors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    />
                    {formErrors.name && (
                      <div className="text-left text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {formErrors.name}
                      </div>
                    )}
                  </div>
  
                  {/* Email Address */}
                  <div className="mb-6 flex flex-col">
                    <label className="text-left text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                      <span className='text-red-500 font-bold ml-1'>*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="contact@enterprise.com"
                      className={`w-full px-4 py-3 border-2 ${
                        formErrors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    />
                    {formErrors.email && (
                      <div className="text-left text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {formErrors.email}
                      </div>
                    )}
                  </div>
  
                  {/* Phone Number */}
                  <div className="mb-6 flex flex-col">
                    <label className="text-left text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      className={`w-full px-4 py-3 border-2 ${
                        formErrors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    />
                    {formErrors.phone && (
                      <div className="text-left text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {formErrors.phone}
                      </div>
                    )}
                  </div>
  
                  {/* Industry */}
                  <div className="mb-6 flex flex-col">
                    <label className="text-left text-sm font-semibold text-gray-700 mb-2">
                      Industry
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      placeholder="e.g., Technology, Healthcare, Finance"
                      className={`w-full px-4 py-3 border-2 ${
                        formErrors.industry ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    />
                    {formErrors.industry && (
                      <div className="text-left text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {formErrors.industry}
                      </div>
                    )}
                  </div>
                </div>
              </div>
  
              {/* Location Information Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-gray-200">
                  Location Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* City */}
                  <div className="mb-6 flex flex-col">
                    <label className="text-left text-sm font-semibold text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                      className={`w-full px-4 py-3 border-2 ${
                        formErrors.city ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    />
                    {formErrors.city && (
                      <div className="text-left text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {formErrors.city}
                      </div>
                    )}
                  </div>
  
                  {/* Website */}
                  <div className="mb-6 flex flex-col">
                    <label className="text-left text-sm font-semibold text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://www.enterprise.com"
                      className={`w-full px-4 py-3 border-2 ${
                        formErrors.website ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    />
                    {formErrors.website && (
                      <div className="text-left text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {formErrors.website}
                      </div>
                    )}
                  </div>
                </div>
  
                {/* Address */}
                <div className="mb-6 flex flex-col">
                  <label className="text-left text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Enter full address"
                    className={`w-full px-4 py-3 border-2 ${
                      formErrors.address ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none`}
                  />
                  {formErrors.address && (
                    <div className="text-left text-red-500 text-sm mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.address}
                    </div>
                  )}
                </div>
              </div>
  
              {/* Company Details Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-gray-200">
                  Company Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Number of Staff */}
                  <div className="mb-6 flex flex-col">
                    <label className="text-left text-sm font-semibold text-gray-700 mb-2">
                      Number of Staff
                    </label>
                    <input
                      type="number"
                      name="noStaff"
                      value={formData.noStaff}
                      onChange={handleChange}
                      placeholder="Enter total number of employees"
                      className={`w-full px-4 py-3 border-2 ${
                        formErrors.noStaff ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    />
                    {formErrors.noStaff && (
                      <div className="text-left text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {formErrors.noStaff}
                      </div>
                    )}
                  </div>
  
                  {/* Years of Existence */}
                  <div className="mb-6 flex flex-col">
                    <label className="text-left text-sm font-semibold text-gray-700 mb-2">
                      Years of Existence
                    </label>
                    <input
                      type="number"
                      name="yearsExistence"
                      value={formData.yearsExistence}
                      onChange={handleChange}
                      placeholder="How many years in operation"
                      className={`w-full px-4 py-3 border-2 ${
                        formErrors.yearsExistence ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    />
                    {formErrors.yearsExistence && (
                      <div className="text-left text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {formErrors.yearsExistence}
                      </div>
                    )}
                  </div>
                </div>
              </div>
  
              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t-2 border-gray-200">
                <Link 
                  to="/enterprises" 
                  className="w-full sm:w-auto px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200 text-center font-medium"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating Enterprise...
                    </span>
                  ) : (
                    "Update Enterprise"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  
export default UpdateEnterprise;