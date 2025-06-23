import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';

const ResetPassword = () => {
    const navigate = useNavigate();
    const { email: urlEmail } = useParams(); // Get email from URL if available
    const { 
        resetPasswordWithCode, 
        requestPasswordResetCode,
        loading: authLoading, 
        error: authError, 
        clearError 
    } = useAuthContext();
    
    const [formData, setFormData] = useState({ 
        email: urlEmail || '',
        providedCode: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        // Update email if it comes from URL params
        if (urlEmail) {
            setFormData(prev => ({ ...prev, email: urlEmail }));
        }
        
        // Clean up errors when component unmounts
        return () => {
            clearError();
        };
    }, [urlEmail, clearError]);

    const validateForm = () => {
        let newErrors = {};
        
        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            newErrors.email = "Email is invalid";
        }
        
        // Code validation
        if (!formData.providedCode.trim()) {
            newErrors.providedCode = "Verification code is required";
        } else if (formData.providedCode.length !== 6) {
            newErrors.providedCode = "Verification code must be 6 digits";
        } else if (!/^\d+$/.test(formData.providedCode)) {
            newErrors.providedCode = "Verification code must contain only numbers";
        }
        
        // Password validation
        if (!formData.newPassword.trim()) {
            newErrors.newPassword = "New password is required";
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = "Password must be at least 8 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
            newErrors.newPassword = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
        }
        
        // Confirm password validation
        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.confirmPassword !== formData.newPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }
        
        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // For code input, only allow numbers
        if (name === 'providedCode' && value && !/^\d*$/.test(value)) {
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
            // Call the API to reset password with code
            const result = await resetPasswordWithCode(formData);
            
            if (result && result.data) {
                setSuccess("Your password has been successfully reset!");
                setFormData({ 
                    email: "", 
                    providedCode: "", 
                    newPassword: "", 
                    confirmPassword: "" 
                });
                // Redirect to login after successful reset
                setTimeout(() => navigate("/login"), 3000);
            } else if (result && result.error) {
                setFormErrors({general: result.error});
            }
        } catch (error) {
            console.error("Password reset error:", error);
            setFormErrors({general: "Password reset failed. Please try again."});
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
            const result = await requestPasswordResetCode(formData.email);
            if (result && result.data) {
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
            <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-2xl transition-all duration-300 hover:translate-y-1">
                <div className="flex flex-col items-center justify-center gap-3 mb-6">
                    <h1 className='text-3xl font-bold text-gray-900'>Adtrack</h1>
                    <div className='bg-primary w-12 h-1 rounded-md'></div>
                    <p className='text-gray-700 text-lg font-medium'>Reset Your Password</p>
                    <p className='text-gray-700'>Enter the verification code and your new password</p>
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
                            disabled={isLoading || !!urlEmail}
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
                            name="providedCode"
                            value={formData.providedCode}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="000000"
                            maxLength={6}
                        />
                        {formErrors.providedCode && <div className="text-left text-red-500 text-xs mt-1">{formErrors.providedCode}</div>}
                        <div className="text-right mt-1">
                            <span 
                                className="text-blue-500 cursor-pointer text-sm"
                                onClick={handleResendCode}
                            >
                                Resend Code
                            </span>
                        </div>
                    </div>

                    <div className="mb-6 flex flex-col">
                        <label className="text-left text-sm font-medium text-gray-700 mb-2">
                            New Password<span className='text-red-500 font-bold'>*</span>
                        </label>
                        <div className="relative">
                            <input
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                type={showNewPassword ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder="Enter your new password"
                            />
                            <span
                                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </span>
                        </div>
                        {formErrors.newPassword && <div className="text-left text-red-500 text-xs mt-1">{formErrors.newPassword}</div>}
                    </div>

                    <div className="mb-6 flex flex-col">
                        <label className="text-left text-sm font-medium text-gray-700 mb-2">
                            Confirm Password<span className='text-red-500 font-bold'>*</span>
                        </label>
                        <div className="relative">
                            <input
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder="Confirm your new password"
                            />
                            <span
                                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </span>
                        </div>
                        {formErrors.confirmPassword && <div className="text-left text-red-500 text-xs mt-1">{formErrors.confirmPassword}</div>}
                    </div>

                    <button
                        type="submit"
                        className="w-full p-3 bg-primary text-white rounded-xl cursor-pointer hover:bg-opacity-90 disabled:opacity-50 mb-6 font-medium"
                        disabled={isLoading}
                    >
                        {isLoading ? "Resetting..." : "Reset Password"}
                    </button>

                    <div className='border-t border-gray-300 pt-4 mb-4'></div>
                    
                    <div className="flex justify-center items-center">
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

export default ResetPassword;