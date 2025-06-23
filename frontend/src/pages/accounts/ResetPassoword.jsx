import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const VerifyResetCode = () => {
    const navigate = useNavigate();
    const { email } = useParams(); // Get email from URL if available
    const { verifyResetCode, loading: authLoading, error: authError, clearError } = useAuthContext();
    
    const [formData, setFormData] = useState({ 
        email: email || '',
        code: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Update email if it comes from URL params
        if (email) {
            setFormData(prev => ({ ...prev, email }));
        }
        
        // Clean up errors when component unmounts
        return () => {
            clearError();
        };
    }, [email, clearError]);

    const validateForm = () => {
        let newErrors = {};
        
        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            newErrors.email = "Email is invalid";
        }
        
        // Code validation
        if (!formData.code.trim()) {
            newErrors.code = "Verification code is required";
        } else if (formData.code.length !== 6) {
            newErrors.code = "Verification code must be 6 digits";
        } else if (!/^\d+$/.test(formData.code)) {
            newErrors.code = "Verification code must contain only numbers";
        }
        
        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // For code input, only allow numbers
        if (name === 'code' && value && !/^\d*$/.test(value)) {
            return;
        }
        
        setFormData((prevData) => ({ ...prevData, [name]: value }));
        
        // Clear field-specific errors when user types
        if (formErrors[name]) setFormErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
        // Clear auth errors when user makes changes
        if (authError) clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess("");
        
        if (!validateForm()) return;
        setLoading(true);

        try {
            const result = await verifyResetCode(formData.email, formData.code);
            
            if (result && result.data && result.data.success) {
                setSuccess("Code verified successfully! Redirecting to reset password page...");
                // Redirect to reset password page with token
                setTimeout(() => {
                    if (result.data.token) {
                        navigate(`/reset-password/${result.data.token}`);
                    } else {
                        // Fallback in case token isn't available
                        navigate("/reset-password");
                    }
                }, 2000);
            } else if (result && result.error) {
                setFormErrors({general: result.error});
            }
        } catch (error) {
            console.error("Code verification error:", error);
            setFormErrors({general: "Code verification failed. Please try again."});
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!formData.email || !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setFormErrors({email: "Please enter a valid email to resend the code"});
            return;
        }
        
        setLoading(true);
        try {
            // Assuming this function exists in your AuthContext
            const result = await resetPassword(formData.email);
            if (result && result.data && result.data.success) {
                setSuccess("A new verification code has been sent to your email!");
            } else if (result && result.error) {
                setFormErrors({general: result.error});
            }
        } catch (error) {
            console.error("Resend code error:", error);
            setFormErrors({general: "Failed to resend verification code. Please try again."});
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
                    <p className='text-gray-700 text-lg font-medium'>Verify Reset Code</p>
                    <p className='text-gray-700'>Enter the 6-digit code sent to your email</p>
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
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading || !!email} // Disable if email is provided in URL
                            placeholder="Enter your registered email"
                        />
                        {formErrors.email && <div className="text-left text-red-500 text-xs mt-1">{formErrors.email}</div>}
                    </div>

                    <div className="mb-6 flex flex-col">
                        <label className="text-left text-sm font-medium text-gray-700 mb-2">
                            Verification Code<span className='text-red-500 font-bold'>*</span>
                        </label>
                        <input
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-center text-xl tracking-widest"
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="000000"
                            maxLength={6}
                        />
                        {formErrors.code && <div className="text-left text-red-500 text-xs mt-1">{formErrors.code}</div>}
                    </div>

                    <button
                        type="submit"
                        className="w-full p-3 bg-primary text-white rounded-xl cursor-pointer hover:bg-opacity-90 disabled:opacity-50 mb-6 font-medium"
                        disabled={isLoading}
                    >
                        {isLoading ? "Verifying..." : "Verify Code"}
                    </button>

                    <div className='border-t border-gray-300 pt-4 mb-4'></div>
                    
                    <div className="flex flex-col justify-center items-center space-y-4">
                        <p className='text-gray-700'>
                            Didn't receive the code?
                            <span className='text-blue-500 cursor-pointer ml-1' onClick={handleResendCode}>Resend Code</span>
                        </p>
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

export default VerifyResetCode;