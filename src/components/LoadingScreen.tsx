export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#60a5fa] mb-4"></div>
        <p className="text-[#f8fafc] text-xl">Loading...</p>
      </div>
    </div>
  );
}
