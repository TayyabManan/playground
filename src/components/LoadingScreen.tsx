export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0f1e] flex items-center justify-center transition-colors duration-300">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#2563eb] dark:border-[#60a5fa] mb-4"></div>
        <p className="text-gray-900 dark:text-[#f8fafc] text-xl">Loading...</p>
      </div>
    </div>
  );
}
