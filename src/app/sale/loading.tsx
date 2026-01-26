export default function Loading() {
  return (
    <div className="app bg-[#fafafa]">
      {/* Category Filter Bar Skeleton */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="py-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 px-5 py-3 rounded-full bg-gray-100 animate-pulse"
                  style={{ width: '100px' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid Skeleton */}
      <div className="max-w-[1440px] mx-auto px-2 md:px-8 py-1 md:py-2">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-[3px] md:gap-x-1.5 gap-y-8 md:gap-y-16">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex flex-col">
              <div className="relative aspect-[100/127] w-full mb-4 overflow-hidden bg-gray-200 animate-pulse rounded-lg" />
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" style={{ width: '80%' }} />
              <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '60%' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
