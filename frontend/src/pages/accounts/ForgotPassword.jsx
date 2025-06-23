import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { requestPasswordResetCode, loading: authLoading, error: authError, clearError } = useAuthContext();
    
    const [email, setEmail] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Clean up errors when component unmounts
        return () => {
            clearError();
        };
    }, [clearError]);

    const validateForm = () => {
        let newErrors = {};
        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            newErrors.email = "Email is invalid";
        }
        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setEmail(e.target.value);
        // Clear field-specific errors when user types
        if (formErrors.email) setFormErrors((prevErrors) => ({ ...prevErrors, email: null }));
        // Clear auth errors when user makes changes
        if (authError) clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess("");
        
        if (!validateForm()) return;
        setLoading(true);

        try {
            // Send request to get password reset code
            const result = await requestPasswordResetCode(email);
            
            if (result && result.data) {
                setSuccess("A verification code has been sent to your email! Please check your inbox.");
                // Redirect to reset password page with email
                setTimeout(() => navigate(`/reset-password/${encodeURIComponent(email)}`), 3000);
            } else if (result && result.error) {
                setFormErrors({general: result.error});
            }
        } catch (error) {
            console.error("Password reset error:", error);
            setFormErrors({general: "Password reset request failed. Please try again."});
        } finally {
            setLoading(false);
        }
    };

    // Combined loading state from local and auth context
    const isLoading = loading || authLoading;

    return (
        <div className='flex flex-col items-center justify-center min-h-screen text-center bg-grayColor'>
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl transition-all duration-300 hover:translate-y-1">
                <div className="flex flex-col items-center justify-center gap-3 mb-6">
                    <h1 className='text-3xl font-bold text-gray-900'>Adtrack</h1>
                    <div className='bg-primary w-12 h-1 rounded-md'></div>
                    <p className='text-gray-700 text-lg font-medium'>Forgot Your Password?</p>
                    <p className='text-gray-700'>Enter your email address and we'll send you a verification code to reset your password.</p>
                </div>

                {success && <div className="p-3 bg-green-100 text-green-700 rounded mb-4">{success}</div>}
                {authError && <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{authError}</div>}
                {formErrors.general && <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{formErrors.general}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-6 flex flex-col">
                        <label className="text-left text-sm font-medium text-gray-700 mb-2">
                            Email<span className='text-red-500 font-bold'>*</span>
                        </label>
                        <input
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            type="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="Enter your registered email"
                        />
                        {formErrors.email && <div className="text-left text-red-500 text-xs mt-1">{formErrors.email}</div>}
                    </div>

                    <button
                        type="submit"
                        className="w-full p-3 bg-primary text-white rounded-xl cursor-pointer hover:bg-opacity-90 disabled:opacity-50 mb-6 font-medium"
                        disabled={isLoading}
                    >
                        {isLoading ? "Sending..." : "Send Verification Code"}
                    </button>

                    <div className='border-t border-gray-300 pt-4 mb-4'></div>
                    
                    <div className="flex justify-between items-center">
                        <p className='text-gray-700'>
                            Remember your password?
                            <span className='text-blue-500 cursor-pointer ml-1' onClick={() => navigate("/login")}>Back to Login</span>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;