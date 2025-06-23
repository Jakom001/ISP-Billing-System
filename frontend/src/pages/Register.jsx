import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Phone, Lock, CheckCircle, AlertCircle, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuthContext } from '../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register, loading: authLoading, error: authError, isAuthenticated, clearError } = useAuthContext();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        termsAccepted: false
    });
    
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            toast.success("Already logged in. Redirecting to dashboard...", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            navigate('/dashboard');
        }
        return () => {
            clearError();
        };
    }, [isAuthenticated, navigate, clearError]);

    // Show auth errors via toast
    // useEffect(() => {
    //     if (authError) {
    //         toast.error(authError, {
    //             position: "top-right",
    //             autoClose: 5000,
    //             hideProgressBar: false,
    //             closeOnClick: true,
    //             pauseOnHover: true,
    //             draggable: true,
    //         });
    //     }
    // }, [authError]);

    const validateForm = () => {
        let newErrors = {};
        
        if (!formData.firstName.trim()) {
            newErrors.firstName = "First name is required";
        } else if (formData.firstName.trim().length < 2) {
            newErrors.firstName = "First name must be at least 2 characters";
        }
        
        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last name is required";
        } else if (formData.lastName.trim().length < 2) {
            newErrors.lastName = "Last name must be at least 2 characters";
        }
        
        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = "Please enter a valid 10-digit phone number with country code";
        }
        
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            newErrors.email = "Please enter a valid email address";
        }
        
        // Password validation
        if (!formData.password.trim()) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = "Password must contain uppercase, lowercase, and number";
        }
        
        // Confirm password validation
        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = "Passwords do not match";
        }
        
        if (!formData.termsAccepted) {
            newErrors.termsAccepted = "You must accept the Terms & Conditions";
        }

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const inputValue = type === 'checkbox' ? checked : value;
        
        // Format phone number as user types
        if (name === 'phone') {
            const cleaned = value.replace(/\D/g, '');
            const formatted = cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
            setFormData(prev => ({ ...prev, [name]: cleaned.length <= 10 ? formatted : prev.phone }));
        } else {
            setFormData(prev => ({ ...prev, [name]: inputValue }));
        }
        
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
        if (authError) clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error("Please correct the errors in the form", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return;
        }
        
        setLoading(true);

        try {
            const { termsAccepted, confirmPassword, ...apiFormData } = formData;
            // Clean phone number for API
            apiFormData.phone = apiFormData.phone.replace(/\D/g, '');
            
            const result = await register(apiFormData);
            
            if (result?.data?.success) {
                toast.success("Registration successful!", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                
                setFormData({
                    firstName: '',
                    lastName: '',
                    phone: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    termsAccepted: false
                });
                
                setTimeout(() => navigate("/login"), 2000);
            } else if (result?.error) {
                toast.error(result.error, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } catch (error) {
            console.error("Registration error:", error);
            toast.error("Registration failed. Please try again.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const isLoading = loading || authLoading;

    const getPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(formData.password);
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

    return (
        <div className='min-h-screen  flex items-center justify-center p-4 sm:p-6 lg:p-8'>
            {/* Background decorative elements */}
            {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
            </div> */}

            <div className="relative w-full max-w-2xl">
                {/* Main card */}
                <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/20 transition-all duration-300 hover:shadow-3xl hover:-translate-y-1">
                    {/* Header */}
                    <div className="flex flex-col items-center justify-center gap-3 mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-2">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <h1 className='text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
                            PTS
                        </h1>
                        <div className='bg-gradient-to-r from-primary to-secondary w-16 h-1 rounded-full'></div>
                        <p className='text-gray-700 text-lg font-medium text-center'>
                            Create your account
                        </p>
                        {/* <p className='text-gray-600 text-sm text-center'>
                            Already have an account? 
                            <button 
                                className='text-primary hover:text-secondary font-medium ml-1 transition-colors duration-200 hover:underline' 
                                onClick={() => navigate("/login")}
                                type="button"
                            >
                                Sign in
                            </button>
                        </p> */}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    First Name
                                    <span className='text-red-500 ml-1'>*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                                            formErrors.firstName 
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        type="text"
                                        name="firstName"
                                        placeholder="Enter first name"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                    {formErrors.firstName && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <AlertCircle className="h-5 w-5 text-red-500" />
                                        </div>
                                    )}
                                </div>
                                {formErrors.firstName && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {formErrors.firstName}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Last Name
                                    <span className='text-red-500 ml-1'>*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                                            formErrors.lastName 
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        type="text"
                                        name="lastName"
                                        placeholder="Enter last name"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                    {formErrors.lastName && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <AlertCircle className="h-5 w-5 text-red-500" />
                                        </div>
                                    )}
                                </div>
                                {formErrors.lastName && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {formErrors.lastName}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Phone field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Phone Number
                                <span className='text-red-500 ml-1'>*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                                        formErrors.phone 
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    type="tel"
                                    name="phone"
                                    placeholder="(254) 728002211"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                {formErrors.phone && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                    </div>
                                )}
                            </div>
                            {formErrors.phone && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {formErrors.phone}
                                </p>
                            )}
                        </div>

                        {/* Email field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Email Address
                                <span className='text-red-500 ml-1'>*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                                        formErrors.email 
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                {formErrors.email && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                    </div>
                                )}
                            </div>
                            {formErrors.email && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {formErrors.email}
                                </p>
                            )}
                        </div>

                        {/* Password field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Password
                                <span className='text-red-500 ml-1'>*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    className={`w-full pl-10 pr-12 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                                        formErrors.password 
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            
                            {/* Password strength indicator */}
                            {formData.password && (
                                <div className="space-y-2">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                                                    level <= passwordStrength 
                                                        ? strengthColors[passwordStrength - 1] 
                                                        : 'bg-gray-200'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <p className={`text-sm ${
                                        passwordStrength <= 2 ? 'text-red-500' : 
                                        passwordStrength <= 3 ? 'text-yellow-500' : 'text-green-500'
                                    }`}>
                                        Password strength: {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                                    </p>
                                </div>
                            )}
                            
                            {formErrors.password && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {formErrors.password}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Confirm Password
                                <span className='text-red-500 ml-1'>*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    className={`w-full pl-10 pr-12 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                                        formErrors.confirmPassword 
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                            : formData.confirmPassword && formData.password === formData.confirmPassword
                                            ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {formData.confirmPassword && formData.password === formData.confirmPassword && !formErrors.confirmPassword && (
                                <p className="text-green-500 text-sm flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4" />
                                    Passwords match
                                </p>
                            )}
                            {formErrors.confirmPassword && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {formErrors.confirmPassword}
                                </p>
                            )}
                        </div>

                        {/* Terms checkbox */}
                        <div className='space-y-2'>
                            <div className='flex items-start gap-3'>
                                <input 
                                    type="checkbox" 
                                    id="termsAccepted" 
                                    name="termsAccepted"
                                    checked={formData.termsAccepted}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2 transition-all duration-200 mt-0.5" 
                                />
                                <label htmlFor="termsAccepted" className='text-sm font-medium text-gray-700 cursor-pointer select-none'>
                                    I agree to the{' '}
                                    <button 
                                        type="button"
                                        className='text-primary hover:text-secondary-light font-medium transition-colors duration-200 hover:underline' 
                                        onClick={() => navigate("/terms-conditions")}
                                    >
                                        Terms & Conditions
                                    </button>
                                    {' and '}
                                    <button 
                                        type="button"
                                        className='text-primary hover:text-secondary-light font-medium transition-colors duration-200 hover:underline' 
                                        onClick={() => navigate("/privacy-policy")}
                                    >
                                        Privacy Policy
                                    </button>
                                    <span className='text-red-500 ml-1'>*</span>
                                </label>
                            </div>
                            {formErrors.termsAccepted && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {formErrors.termsAccepted}
                                </p>
                            )}
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary hover:from-primary-light  hover:to-secondary-light text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                            disabled={isLoading}
                        >
                            <span className="flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-5 h-5" />
                                        Create Account
                                    </>
                                )}
                            </span>
                        </button>

                        {/* Divider */}
                        <div className='relative my-6'>
                            <div className='absolute inset-0 flex items-center'>
                                <div className='w-full border-t border-gray-300'></div>
                            </div>
                            <div className='relative flex justify-center text-sm'>
                                <span className='px-2 bg-white text-gray-500'>Already have an account?</span>
                            </div>
                        </div>

                        {/* Login link */}
                        <div className="text-center">
                            <button 
                                type="button"
                                className='text-primary hover:text-secondary font-medium transition-colors duration-200 hover:underline' 
                                onClick={() => navigate("/login")}
                            >
                                Sign in to your account
                            </button>
                        </div>
                    </form>
                </div>

                {/* Additional help text */}
                {/* <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm">
                        Need help? 
                        <button 
                            type="button"
                            className="text-primary hover:text-secondary font-medium ml-1 transition-colors duration-200 hover:underline"
                            onClick={() => navigate("/support")}
                        >
                            Contact Support
                        </button>
                    </p>
                </div> */}
            </div>
        </div>
    );
};

export default Register;