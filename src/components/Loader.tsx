const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
      <p className="text-xl font-semibold">Loading...</p>
    </div>
  );
};

export default Loader;
