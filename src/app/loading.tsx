export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="animate-pulse">
        <div className="h-96 bg-gray-200 mb-8"></div>
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
            {[...Array(8)].map((_, i) => (
              <div key={i}>
                <div className="aspect-[100/127] w-full mb-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
