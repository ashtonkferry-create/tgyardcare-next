export default function Loading() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5">
      <div className="h-full bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400 animate-loading-bar" />
    </div>
  );
}
