const LoadingSpinner = () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
        <p className="text-gray-400">Loading questions...</p>
      </div>
    );
  };
  
  export default LoadingSpinner;