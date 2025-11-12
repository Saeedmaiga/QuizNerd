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
