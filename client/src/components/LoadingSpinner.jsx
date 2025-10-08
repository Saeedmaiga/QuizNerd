const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600/30 border-t-purple-600 mb-6"></div>
        <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-purple-400/20"></div>
      </div>
      <div className="text-center">
        <p className="text-xl font-semibold text-gray-300 mb-2">Loading questions...</p>
        <p className="text-sm text-gray-400">Preparing your quiz experience</p>
      </div>
    </div>
  );
};
  
  export default LoadingSpinner;