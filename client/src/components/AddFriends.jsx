import { useState, useEffect } from "react";
import { API_ENDPOINTS } from '../config/api';

export default function AddFriends({ onBack, themeClasses, playSound, userId, username, token }) {
  const [searchName, setSearchName] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [message, setMessage] = useState(null);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [selectedFriendForStats, setSelectedFriendForStats] = useState(null);

  // Load friends and pending requests
  useEffect(() => {
    loadFriends();
    loadPendingRequests();
  }, [userId]);

  async function loadFriends() {
    try {
      const res = await fetch(`${API_ENDPOINTS.FRIENDS}?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error("Failed to load friends:", error);
    }
  }

  async function loadPendingRequests() {
    try {
      const res = await fetch(`${API_ENDPOINTS.FRIENDS}/requests?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPendingRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Failed to load pending requests:", error);
    }
  }

  function clearSearch() {
    playSound();
    setSearchName("");
    setSearchResult(null);
    setMessage(null);
  }

  // Search users
  async function handleSearch() {
    playSound();
    setMessage(null);

    const name = searchName.trim();
    if (!name || name.length < 2) {
      setMessage({ type: "error", text: "Search query must be at least 2 characters" });
      return;
    }

    setSearching(true);
    setSearchResult(null);

    try {
      const res = await fetch(`${API_ENDPOINTS.FRIENDS}/search?query=${encodeURIComponent(name)}&userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && data.users && data.users.length > 0) {
        setSearchResult({ found: true, users: data.users });
      } else {
        setSearchResult({ found: false });
      }
    } catch (error) {
      setSearchResult({ found: false });
      setMessage({ type: "error", text: "Failed to search users" });
    }

    setSearching(false);
  }

  // Send friend request
  async function handleAddFriend(friendId) {
    playSound();
    setMessage(null);
    setLoadingAdd(true);

    try {
        const res = await fetch(`${API_ENDPOINTS.FRIENDS}/request`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userId,
          friendId: friendId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Friend request sent!" });
        clearSearch();
        loadPendingRequests(); // Reload to show sent requests
      } else {
        setMessage({ type: "error", text: data.error || "Failed to send friend request." });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Network error." });
    }

    setLoadingAdd(false);
  }

  // Accept friend request
  async function handleAcceptRequest(requestId) {
    playSound();
    try {
        const res = await fetch(`${API_ENDPOINTS.FRIENDS}/accept`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: userId,
            requestId: requestId,
          }),
        });

      if (res.ok) {
        setMessage({ type: "success", text: "Friend request accepted!" });
        loadFriends();
        loadPendingRequests();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to accept request" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error" });
    }
  }

  // Decline friend request
  async function handleDeclineRequest(requestId) {
    playSound();
    try {
        const res = await fetch(`${API_ENDPOINTS.FRIENDS}/decline`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: userId,
            requestId: requestId,
          }),
        });

      if (res.ok) {
        setMessage({ type: "success", text: "Friend request declined" });
        loadPendingRequests();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to decline request" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error" });
    }
  }

  // Show friend stats
  function handleShowFriendStats(friend) {
    playSound();
    setSelectedFriendForStats(friend);
  }

  // Remove friend
  async function handleRemoveFriend(friendId) {
    playSound();
    if (!window.confirm("Are you sure you want to remove this friend?")) return;

    try {
        const res = await fetch(`${API_ENDPOINTS.FRIENDS}/${friendId}`, {
          method: "DELETE",
          headers: { 
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
          },
        });

      if (res.ok) {
        setMessage({ type: "success", text: "Friend removed" });
        loadFriends();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to remove friend" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error" });
    }
  }

  return (
    <div className={`min-h-screen px-4 py-6 ${themeClasses.bg} ${themeClasses.text} relative`}>
      {/* TOP-LEFT BACK BUTTON */}
      <button
        onClick={() => { playSound(); onBack(); }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:scale-105 transition-all"
      >
        ← Back
      </button>

      <div className="mt-10 w-full max-w-6xl mx-auto">
        {/* TABS */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => { playSound(); setShowRequests(false); }}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              !showRequests
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => { playSound(); setShowRequests(true); }}
            className={`px-6 py-2 rounded-lg font-semibold transition-all relative ${
              showRequests
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Requests
            {pendingRequests.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* FLEX CONTAINER */}
        <div className="flex flex-row gap-6 items-start">
          {/* LEFT SIDE: FRIEND LIST OR REQUESTS */}
          <div className="flex-1 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-center mb-3">
              {showRequests ? 'Friend Requests' : 'List of Friends'}
            </h2>
            
            {showRequests ? (
              // PENDING REQUESTS
              <div className="border border-white rounded-xl h-64 overflow-y-auto space-y-4 pt-2 pl-2 pr-2">
                {pendingRequests.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No pending requests</p>
                ) : (
                  pendingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="bg-white/10 border border-white/20 backdrop-blur-lg p-4 rounded-xl shadow-lg flex justify-between items-center hover:scale-[1.02] transition-all"
                    >
                      <div>
                        <p className="text-white font-semibold">
                          {request.requester?.username || request.requester?.name || 'Unknown User'}
                        </p>
                        <p className="text-gray-300 text-sm">
                          {request.requester?.email || ''}
                        </p>
                        {request.message && (
                          <p className="text-gray-400 text-xs mt-1">"{request.message}"</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(request._id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(request._id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // FRIENDS LIST
              <div className="border border-white rounded-xl h-64 overflow-y-auto space-y-4 pt-2 pl-2 pr-2">
                {friends.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">You have no friends yet.</p>
                ) : (
                  friends.map((friend) => (
                    <div
                      key={friend.userId}
                      className="bg-white/10 border border-white/20 backdrop-blur-lg p-4 rounded-xl shadow-lg flex justify-between items-center hover:scale-[1.02] transition-all"
                    >
                      <div className="flex-1">
                        <p className="text-white font-semibold">
                          {friend.username || friend.name || 'Unknown User'}
                        </p>
                        <p className="text-gray-300 text-sm">{friend.email || ''}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShowFriendStats(friend)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
                        >
                          Stats
                        </button>
                        <button
                          onClick={() => handleRemoveFriend(friend.userId)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDE: SEARCH / ADD FRIEND */}
          <div className="flex-1 flex flex-col items-center backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl h-[400px]">
            <h2 className="text-2xl font-bold mb-3 text-center">Add Friends</h2>
            
            {/* SEARCH INPUT */}
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Enter username or email"
              className="w-full border border-white px-4 py-2 rounded-lg mb-4 text-white bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            />
            
            {/* SEARCH & CLEAR BUTTONS */}
            <div className="flex gap-4 mb-4">
              <button
                onClick={handleSearch}
                disabled={searching}
                className="w-32 h-11 flex items-center justify-center bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500 text-white rounded-lg font-semibold hover:scale-105 transition-all disabled:opacity-50"
              >
                {searching ? "Searching…" : "🔍 Search"}
              </button>
              <button
                onClick={clearSearch}
                className="w-32 h-11 flex items-center justify-center bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg font-semibold hover:scale-105 transition-transform"
              >
                ✖ Clear
              </button>
            </div>

            {/* SEARCH RESULTS */}
            <div className="w-full flex-1 overflow-y-auto">
              {searchResult?.found && searchResult.users && (
                <div className="space-y-2">
                  {searchResult.users.map((user) => (
                    <div
                      key={user.userId}
                      className="p-4 bg-gray-800/70 border border-gray-700 rounded-xl flex items-center justify-between shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-2xl">
                          👤
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {user.username || user.name || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-400">{user.email || ''}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddFriend(user.userId)}
                        disabled={loadingAdd}
                        className={`px-3 py-1 rounded-lg hover:scale-105 transition-transform ${
                          loadingAdd
                            ? "opacity-60 bg-gray-500 cursor-not-allowed"
                            : "bg-pink-600 text-white"
                        }`}
                      >
                        {loadingAdd ? "Adding…" : "Add"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {searchResult && !searchResult.found && (
                <div className="p-4 bg-red-500/20 border border-red-500 text-red-400 rounded-xl text-center shadow-md">
                  No users found matching "{searchName}"
                </div>
              )}

              {message && (
                <div className={`mt-4 text-center font-semibold ${
                  message.type === "error" ? "text-red-500" : "text-green-500"
                }`}>
                  {message.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Friend Stats Modal */}
      {selectedFriendForStats && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedFriendForStats(null)}>
          <div className="bg-gray-900/90 backdrop-blur-xl text-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-700/50" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">
                📊 {selectedFriendForStats.username || selectedFriendForStats.name || 'Friend'}'s Stats
              </h3>
              <button 
                className="text-gray-400 hover:text-white text-2xl transition-colors" 
                onClick={() => setSelectedFriendForStats(null)}
              >
                ✖
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-800/60 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm mb-2">Friend Statistics</p>
                <p className="text-gray-300">
                  Stats feature coming soon! Friend statistics will be displayed here.
                </p>
              </div>
              <button
                onClick={() => setSelectedFriendForStats(null)}
                className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
  