import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

export default function EmailVerification({ theme, themeClasses, user, token }) {
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user?.id) {
      checkVerificationStatus();
    }
  }, [user]);

  // Refresh status when component becomes visible (e.g., after returning from email link)
  useEffect(() => {
    if (!user?.id || emailVerified) return;
    
    const interval = setInterval(() => {
      checkVerificationStatus();
    }, 10000); // Check every 10 seconds if not verified

    return () => clearInterval(interval);
  }, [user?.id, emailVerified]);

  const checkVerificationStatus = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH}/verification-status/${user.id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        setEmailVerified(data.emailVerified || false);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestVerification = async () => {
    if (!user?.id || !token) {
      setMessage({ type: 'error', text: 'Authentication required' });
      return;
    }
    
    setSending(true);
    setMessage(null);
    
    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH}/request-verification`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: data.message || 'Verification email sent! Please check your inbox.' 
        });
        
        // If email not configured, show the token/URL for development
        if (data.token) {
          console.log('Email not configured. Verification token:', data.token);
          console.log('Verification URL:', data.verificationUrl);
          setMessage({ 
            type: 'info', 
            text: `Email not configured. Use this link: ${data.verificationUrl}` 
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to send verification email' }));
        setMessage({ type: 'error', text: errorData.error || 'Failed to send verification email' });
      }
    } catch (error) {
      console.error('Error requesting verification:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className={`${themeClasses.card} rounded-xl p-4`}>
        <div className="animate-pulse">Checking verification status...</div>
      </div>
    );
  }

  return (
    <div className={`${themeClasses.card} rounded-xl p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Email Verification</h3>
        {emailVerified ? (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold flex items-center gap-2">
            <span>✓</span>
            Verified
          </span>
        ) : (
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-semibold flex items-center gap-2">
            <span>⚠</span>
            Not Verified
          </span>
        )}
      </div>

      {user?.email && (
        <p className="text-sm text-gray-400">
          Email: <span className="font-semibold text-white">{user.email}</span>
        </p>
      )}

      {!emailVerified && (
        <div className="space-y-2">
          <p className="text-sm text-yellow-400">
            ⚠️ Please verify your email address to access all features.
          </p>
          <button
            onClick={handleRequestVerification}
            disabled={sending}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition disabled:opacity-50 text-sm"
          >
            {sending ? 'Sending...' : 'Send Verification Email'}
          </button>
          {message && (
            <div className={`px-3 py-2 rounded-lg text-sm ${
              message.type === 'error' 
                ? 'bg-red-500/20 text-red-400' 
                : message.type === 'info'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-green-500/20 text-green-400'
            }`}>
              {message.text}
            </div>
          )}
          <p className="text-xs text-gray-500">
            Note: Check your email inbox (and spam folder) for the verification link. The link expires in 24 hours.
          </p>
        </div>
      )}

      {emailVerified && (
        <p className="text-sm text-green-400">
          ✓ Your email has been verified. You have full access to all features.
        </p>
      )}
    </div>
  );
}

