import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

export default function InviteFriendsModal({ 
  sessionCode, 
  userId, 
  onClose, 
  theme, 
  themeClasses 
}) {
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadFriends();
  }, [userId]);

  const loadFriends = async () => {
    try {
              const response = await fetch(`${API_ENDPOINTS.FRIENDS}?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleInvite = async () => {
    if (selectedFriends.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one friend' });
      return;
    }

    setInviting(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_ENDPOINTS.MULTIPLAYER}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionCode,
          userId,
          friendIds: selectedFriends,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `Invited ${data.invitedCount} friend(s)!` });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send invitations' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className={`${themeClasses.card} rounded-xl p-6`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-center">Loading friends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className={`${themeClasses.card} rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Invite Friends</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {friends.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            You don't have any friends yet. Add friends from your profile!
          </p>
        ) : (
          <>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {friends.map((friend) => (
                <label
                  key={friend.userId}
                  className={`${themeClasses.panelBg} rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-700/50 transition`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFriends.includes(friend.userId)}
                    onChange={() => toggleFriendSelection(friend.userId)}
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{friend.username || friend.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-400">{friend.email || ''}</p>
                  </div>
                </label>
              ))}
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-lg text-center ${
                message.type === 'error' 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-green-500/20 text-green-400'
              }`}>
                {message.text}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={inviting || selectedFriends.length === 0}
                className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
              >
                {inviting ? 'Inviting...' : `Invite (${selectedFriends.length})`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

