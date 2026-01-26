export default function Loading() {
  return (
    <div className="app bg-[#fafafa]">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="py-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              <div className="flex-shrink-0 px-5 py-3 rounded-full bg-gray-100 animate-pulse h-[41px] w-24"></div>
              <div className="flex-shrink-0 px-5 py-3 rounded-full bg-gray-100 animate-pulse h-[41px] w-24"></div>
              <div className="flex-shrink-0 px-5 py-3 rounded-full bg-gray-100 animate-pulse h-[41px] w-24"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-[1440px] mx-auto px-2 md:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[100/127] w-full mb-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
