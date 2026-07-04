'use client';

export default function DashboardChart({ title, subtitle, data = [], color = '#6366F1' }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-[#212121] rounded-xl p-6 border border-[rgba(255,255,255,0.06)]">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-white font-medium">{title}</h3>
        {subtitle && (
          <p className="text-xs text-[#717171] mt-1">{subtitle}</p>
        )}
      </div>

      {/* Bar chart */}
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-sm text-[#717171]">暂无数据</p>
        </div>
      ) : (
        <div className="flex items-end gap-3 h-48">
          {data.map((item, index) => {
            const heightPercent = (item.value / maxValue) * 100;
            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-2 min-w-0"
              >
                {/* Value label */}
                <span className="text-xs text-[#AAAAAA]">{item.value}</span>

                {/* Bar */}
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-md transition-all duration-500 ease-out"
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: color,
                      minHeight: item.value > 0 ? '4px' : '0px',
                    }}
                  />
                </div>

                {/* Name label */}
                <span className="text-[10px] text-[#717171] truncate w-full text-center">
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
