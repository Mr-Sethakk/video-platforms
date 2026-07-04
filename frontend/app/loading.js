import Skeleton from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* TopBar placeholder */}
      <div className="h-14 bg-[#0F0F0F] border-b border-[rgba(255,255,255,0.08)]" />

      <div className="flex">
        {/* Sidebar placeholder - collapsed on mobile, visible on desktop */}
        <div className="hidden sm:block w-16 bg-[#0F0F0F] border-r border-[rgba(255,255,255,0.08)]" />

        {/* Main content area */}
        <div className="flex-1 px-6 pt-6">
          {/* Category chips placeholder */}
          <div className="flex gap-3 mb-6 overflow-x-auto">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-20 rounded-full bg-[#272727] animate-pulse flex-shrink-0"
              />
            ))}
          </div>

          {/* Movie grid skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 gap-y-10">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} variant="grid" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
