// AddFriends.jsx
import { useState, useEffect } from "react";

export default function AddFriends({ onBack, themeClasses, playSound, userId }) {
  const [searchName, setSearchName] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [message, setMessage] = useState(null);
  const [friends, setFriends] = useState([
  {
    id: 1,
    username: "CoolPlayer123",
    wins: 10,
    games: 25,
    online: true
  },
  {
    id: 2,
    username: "GamerGirl99",
    wins: 5,
    games: 12,
    online: false
  },
  {
    id: 3,
    username: "CoolPlayer123",
    wins: 10,
    games: 25,
    online: true
  },
  {
    id: 4,
    username: "GamerGirl99",
    wins: 5,
    games: 12,
    online: false
  },
  {
    id: 5,
    username: "CoolPlayer123",
    wins: 10,
    games: 25,
    online: true
  },
  {
    id: 6,
    username: "GamerGirl99",
    wins: 5,
    games: 12,
    online: false
  }
]);

  // LOAD CURRENT FRIENDS
  useEffect(() => {
    async function loadFriends() {
      try {
        const res = await fetch(`/api/friends?userId=${userId}`);
        const data = await res.json();
        if (res.ok) setFriends(data.friends || []);
      } catch {
        console.error("Failed to load friends.");
      }
    }
    loadFriends();
  }, [userId]);

  //Clear search
  function clearSearch() {
    playSound();
    setSearchName("");
    setSearchResult(null);
    setMessage(null);
  }

  // SEARCH USER
  async function handleSearch() {
    playSound();
    setMessage(null);

    const name = searchName.trim();
    if (!name) return;

    setSearching(true);
    setSearchResult(null);

    try {
      const res = await fetch(`/api/users?username=${name}`);
      const data = await res.json();

      if (res.ok && data.user) {
        setSearchResult({ found: true, user: data.user });
      } else {
        setSearchResult({ found: false });
      }
    } catch {
      setSearchResult({ found: false });
    }

    setSearching(false);
  }

  // ADD FRIEND
  async function handleAddFriend(targetId) {
    playSound();
    setMessage(null);
    setLoadingAdd(true);

    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterId: userId,
          targetId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Friend added!" });
        // update friend list
        setFriends((prev) => [...prev, data.newFriend]);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to add friend." });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Network error." });
    }

    setLoadingAdd(false);
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
        {/* FLEX CONTAINER */}
        <div className="flex flex-row gap-6 items-start">

          {/* LEFT SIDE: FRIEND LIST */}
          <div className="flex-1 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl h-100"> 
            <h2 className="text-2xl font-bold text-center mb-3">List of Friends</h2>
            {friends.length === 0 ? (
              <p className="text-gray-400 text-center">You have no friends yet.</p>
            ) : (
              <div className="border border-white rounded-xl h-64 overflow-y-auto space-y-4 pt-2 pl-2 pr-2">
                {friends.map((f) => (
                  <div
                    key={f.id}
                    className="
                      bg-white/10 border border-white/20 backdrop-blur-lg 
                      p-4 rounded-xl shadow-lg 
                      flex justify-between items-center
                      hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]
                      transition-all
                    "
                  >
                    {/* LEFT SIDE – username + stats */}
                    <div>
                      <p className="text-white font-semibold">{f.username}</p>
                      <p className="text-gray-300 text-sm">Wins: {f.wins ?? 0}</p>
                      <p className="text-gray-300 text-sm">Games: {f.games ?? 0}</p>
                    </div>

                    {/* RIGHT SIDE – online dot */}
                    <div className="flex items-center">
                        <span className={`text-xs ${f.online ? 'text-green-400' : 'text-gray-500'}`}>
                          ● {f.online ? 'Online' : 'Offline'}
                        </span>
                    </div>
                  </div>
                ))}
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
              placeholder="Enter username"
              className="
                w-full border border-white px-4 py-2 rounded-lg mb-4 text-white
                transition-all duration-300
                hover:shadow-[0_0_15px_rgba(168,85,247,0.7)]
                hover:scale-[1.02]
                focus:shadow-[0_0_20px_rgba(168,85,247,0.9)]
                focus:scale-[1.03]
              "
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            />
            {/* SEARCH & CLEAR BUTTONS */}
            <div className="flex gap-4 mb-4">
              <button
                onClick={handleSearch}
                className="w-32 h-11 flex items-center justify-center
                            bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500
                            text-white rounded-lg font-semibold
                            hover:scale-105 transition-all"      
              >
                🔍 Search
              </button>

              <button
                onClick={clearSearch}
                className="w-32 h-11 flex items-center justify-center 
                          bg-gradient-to-r from-pink-500 to-rose-600 
                          text-white rounded-lg font-semibold 
                          hover:scale-105 transition-transform"
              >
                ✖ Clear
              </button>
            </div>

            {/* SEARCHING */}
            {searching && <p className="text-gray-400 mb-4">Searching…</p>}

            {/* SEARCH RESULT */}
            <div className="w-full">
              {searchResult?.found && (
                <div className="p-4 bg-gray-800/70 border border-gray-700 rounded-xl flex items-center justify-between shadow-md animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-2xl">
                      👤
                    </div>
                    <div>
                      <p className="font-semibold">{searchResult.user.username}</p>
                      <p className="text-sm text-gray-400">User found</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddFriend(searchResult.user.id)}
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
              )}

              {searchResult && !searchResult.found && (
                <div className="p-4 bg-red-500/20 border border-red-500 text-red-400 rounded-xl text-center shadow-md animate-fadeIn">
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
export default function AddFriends({ onBack, themeClasses, playSound }) {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${themeClasses.bg} ${themeClasses.text}`}>
      <h1 className="text-3xl font-bold mb-6">Add Friends</h1>

      <input
        type="text"
        placeholder="Enter friend’s username"
        className="border px-4 py-2 rounded-lg mb-4 text-black"
      />

      <div className="flex gap-4">
        <button
          onClick={() => {
            playSound();
            alert("Friend added!");
          }}
          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg font-semibold hover:scale-105 transition-transform"
        >
          ➕ Add Friend
        </button>

        <button
          onClick={() => {
            playSound();
            onBack();
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:scale-105 transition-transform"
        >
          🔙 Back
        </button>
      </div>
    </div>
  );
}
