import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuthContext } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login, loading: authLoading, isAuthenticated, clearError } = useAuthContext();
    
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        // Check URL parameters for session expired message
        const params = new URLSearchParams(window.location.search);
        if (params.get('session') === 'expired') {
            toast.error('Your session has expired. Please log in again.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
        
        // Redirect if already authenticated - REMOVED DUPLICATE TOAST
        if (isAuthenticated) {
            navigate("/dashboard");
        }
        
        // Clean up errors when component unmounts
        return () => {
            clearError();
        };
    }, [isAuthenticated, navigate, clearError]);

    // REMOVED: The useEffect that was showing authError toasts

    const validateForm = () => {
        let newErrors = {};
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            newErrors.email = "Please enter a valid email address";
        }
        if (!formData.password.trim()) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }
        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
        // Clear field-specific errors when user types
        if (formErrors[name]) {
            setFormErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
        }
        // Clear auth errors when user makes changes
        clearError();
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
            const result = await login(formData);
            
            if (result && result.data && result.data.success) {
                toast.success("Login successful! Redirecting...", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                setFormData({ email: "", password: "" });
                // Navigation will be handled by the useEffect when isAuthenticated changes
            } else {
                // Handle login failure - show error toast
                const errorMessage = result?.error || "Login failed. Please try again.";
                toast.error(errorMessage, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Login failed. Please try again.", {
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

    // Combined loading state from local and auth context
    const isLoading = loading || authLoading;

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8'>
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Main card */}
                <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/20 transition-all duration-300 hover:shadow-3xl hover:-translate-y-1">
                    {/* Header */}
                    <div className="flex flex-col items-center justify-center gap-3 mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-2">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <h1 className='text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
                            PTS
                        </h1>
                        <div className='bg-gradient-to-r from-primary to-secondary w-16 h-1 rounded-full'></div>
                        <p className='text-gray-700 text-lg font-medium text-center'>
                            Welcome back!
                        </p>
                        <p className='text-gray-600 text-sm text-center'>
                            Don't have an account? 
                            <button 
                                className='text-blue-600 hover:text-blue-700 font-medium ml-1 transition-colors duration-200 hover:underline' 
                                onClick={() => navigate("/register")}
                                type="button"
                            >
                                Sign up
                            </button>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
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
                            <div className='flex justify-between items-center'>
                                <label className="block text-sm font-semibold text-gray-700">
                                    Password
                                    <span className='text-red-500 ml-1'>*</span>
                                </label>
                                <button 
                                    type="button"
                                    className='text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200 hover:underline' 
                                    onClick={() => navigate("/forgot-password")}
                                >
                                    Forgot Password?
                                </button>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    className={`w-full pl-10 pr-12 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                                        formErrors.password 
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
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
                            {formErrors.password && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {formErrors.password}
                                </p>
                            )}
                        </div>

                        {/* Remember me checkbox */}
                        <div className='flex items-center gap-3'>
                            <input 
                                type="checkbox" 
                                id="remember" 
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-all duration-200" 
                            />
                            <label htmlFor="remember" className='text-sm font-medium text-gray-700 cursor-pointer select-none'>
                                Remember me 
                            </label>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary hover:from-primary-light hover:to-secondary-light text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            disabled={isLoading}
                        >
                            <span className="flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </span>
                        </button>

                        {/* Divider */}
                        <div className='relative my-6'>
                            <div className='absolute inset-0 flex items-center'>
                                <div className='w-full border-t border-gray-300'></div>
                            </div>
                            <div className='relative flex justify-center text-sm'>
                                <span className='px-2 bg-white text-gray-500'>By continuing, you agree to our</span>
                            </div>
                        </div>

                        {/* Terms */}
                        <p className='text-center text-gray-600 text-sm'>
                            <button 
                                type="button"
                                className='text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline' 
                                onClick={() => navigate("/terms-conditions")}
                            >
                                Terms & Conditions
                            </button>
                            {' and '}
                            <button 
                                type="button"
                                className='text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline' 
                                onClick={() => navigate("/privacy-policy")}
                            >
                                Privacy Policy
                            </button>
                        </p>
                    </form>
                </div>

                {/* Additional help text */}
                <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm">
                        Need help? 
                        <button 
                            type="button"
                            className="text-blue-600 hover:text-blue-700 font-medium ml-1 transition-colors duration-200 hover:underline"
                            onClick={() => navigate("/support")}
                        >
                            Contact Support
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;