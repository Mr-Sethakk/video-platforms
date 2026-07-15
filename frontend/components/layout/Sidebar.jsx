'use client';
import { useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const NAV_BASE_CLASSES =
  'flex items-center gap-6 h-10 px-3 rounded-xl text-sm text-white transition-colors hover:bg-[#272727]';
const NAV_COLLAPSED_CLASSES =
  'flex flex-col items-center justify-center gap-1 h-[74px] px-1 rounded-xl text-center text-white transition-colors hover:bg-[#272727]';

function NavItem({ href, icon, label, collapsed, active, onClick, badge }) {
  if (collapsed) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`${NAV_COLLAPSED_CLASSES} ${active ? 'bg-[#272727] font-medium' : ''}`}
      >
        <span>{icon}</span>
        <span className="text-[10px] text-[#AAAAAA] leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[56px]">
          {label}
        </span>
        {badge != null && badge > 0 && (
          <span className="text-[10px] bg-[#6366F1] text-white rounded-full px-1.5 leading-tight min-w-[18px] text-center">
            {badge}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${NAV_BASE_CLASSES} ${active ? 'bg-[#272727] text-white font-medium' : ''}`}
    >
      <span className="w-6 flex items-center justify-center shrink-0 text-lg">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {badge != null && badge > 0 && (
        <span className="text-xs bg-[#6366F1] text-white rounded-full px-2 py-0.5 leading-tight ml-auto">
          {badge}
        </span>
      )}
    </Link>
  );
}

function Divider() {
  return <div className="mx-3 my-2 border-t border-[rgba(255,255,255,0.08)]" />;
}

export default function Sidebar({ isOpen, onClose, watchlistCount = 0, isAdmin = false }) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  const isActive = useCallback((href) => pathname === href, [pathname]);

  const handleNavClick = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  // Mobile overlay backdrop
  const sidebarContent = (
    <aside
      className={`
        fixed left-0 top-14 h-[calc(100vh-56px)] z-40
        bg-[#0F0F0F] border-r border-[rgba(255,255,255,0.08)]
        overflow-y-auto overflow-x-hidden
        transition-[width] duration-200 ease-in-out
        ${isOpen ? 'w-60' : 'w-16'}
        hidden sm:block
      `}
    >
      <nav className="py-2 pb-4">
        {isAdmin ? (
          /* ===== Admin-only nav ===== */
          <>
            <NavItem href="/admin" icon="📊" label="仪表盘" collapsed={!isOpen} active={pathname === '/admin'} onClick={handleNavClick} />
            <NavItem href="/admin/movies" icon="🎬" label="影视管理" collapsed={!isOpen} active={pathname.startsWith('/admin/movies')} onClick={handleNavClick} />
            <NavItem href="/admin/categories" icon="🏷️" label="分类管理" collapsed={!isOpen} active={isActive('/admin/categories')} onClick={handleNavClick} />
            <NavItem href="/admin/users" icon="👥" label="用户管理" collapsed={!isOpen} active={isActive('/admin/users')} onClick={handleNavClick} />
            <NavItem href="/admin/videos" icon="🎥" label="视频管理" collapsed={!isOpen} active={pathname.startsWith('/admin/videos')} onClick={handleNavClick} />
            <NavItem href="/admin/review" icon="✅" label="视频审核" collapsed={!isOpen} active={isActive('/admin/review')} onClick={handleNavClick} />
            <NavItem href="/admin/membership" icon="💎" label="会员套餐" collapsed={!isOpen} active={isActive('/admin/membership')} onClick={handleNavClick} />
            <NavItem href="/admin/orders" icon="📋" label="订单管理" collapsed={!isOpen} active={isActive('/admin/orders')} onClick={handleNavClick} />
            <NavItem href="/admin/financials" icon="💰" label="财务管理" collapsed={!isOpen} active={isActive('/admin/financials')} onClick={handleNavClick} />
            <NavItem href="/admin/settings" icon="⚙️" label="系统设置" collapsed={!isOpen} active={isActive('/admin/settings')} onClick={handleNavClick} />
            <Divider />
            <NavItem href="/" icon="🏠" label="返回首页" collapsed={!isOpen} active={false} onClick={handleNavClick} />
          </>
        ) : (
          /* ===== Normal user nav ===== */
          <>
            <NavItem href="/" icon="🏠" label="首页" collapsed={!isOpen} active={isActive('/')} onClick={handleNavClick} />
            <NavItem href="/movies?sort=rating" icon="🔥" label="热门" collapsed={!isOpen} active={isActive('/movies?sort=rating')} onClick={handleNavClick} />
            <NavItem href="/movies?sort=year" icon="🆕" label="最新" collapsed={!isOpen} active={isActive('/movies?sort=year')} onClick={handleNavClick} />
            <Divider />
            {isAuthenticated && (
              <>
                <NavItem href="/profile" icon="👤" label="个人中心" collapsed={!isOpen} active={isActive('/profile')} onClick={handleNavClick} />
                <NavItem href="/watchlist" icon="📋" label="我的片单" collapsed={!isOpen} active={isActive('/watchlist')} badge={watchlistCount} onClick={handleNavClick} />
                <NavItem href="/upload" icon="📤" label="上传视频" collapsed={!isOpen} active={isActive('/upload')} onClick={handleNavClick} />
                <Divider />
              </>
            )}
            <NavItem href="/about" icon="ℹ️" label="关于" collapsed={!isOpen} active={isActive('/about')} onClick={handleNavClick} />
            <NavItem href="/help" icon="❓" label="帮助" collapsed={!isOpen} active={isActive('/help')} onClick={handleNavClick} />
          </>
        )}
      </nav>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar (hidden on mobile) */}
      {sidebarContent}

      {/* Mobile overlay when sidebar is open */}
      {isOpen && (
        <div className="sm:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleNavClick}
          />
          {/* Sidebar panel */}
          <aside
            className="absolute left-0 top-0 h-full w-60 bg-[#0F0F0F] border-r border-[rgba(255,255,255,0.08)] overflow-y-auto animate-slide-in-left"
          >
            <div className="h-14 flex items-center px-4 border-b border-[rgba(255,255,255,0.08)]">
              <Link href="/" className="text-xl font-bold text-white" onClick={handleNavClick}>
                🎬 电影APP
              </Link>
            </div>
            <nav className="py-2 pb-4">
              {isAdmin ? (
                <>
                  <NavItem href="/admin" icon="📊" label="仪表盘" collapsed={false} active={pathname === '/admin'} onClick={handleNavClick} />
                  <NavItem href="/admin/movies" icon="🎬" label="影视管理" collapsed={false} active={pathname.startsWith('/admin/movies')} onClick={handleNavClick} />
                  <NavItem href="/admin/categories" icon="🏷️" label="分类管理" collapsed={false} active={isActive('/admin/categories')} onClick={handleNavClick} />
                  <NavItem href="/admin/users" icon="👥" label="用户管理" collapsed={false} active={isActive('/admin/users')} onClick={handleNavClick} />
                  <NavItem href="/admin/videos" icon="🎥" label="视频管理" collapsed={false} active={pathname.startsWith('/admin/videos')} onClick={handleNavClick} />
                  <NavItem href="/admin/review" icon="✅" label="视频审核" collapsed={false} active={isActive('/admin/review')} onClick={handleNavClick} />
                  <NavItem href="/admin/membership" icon="💎" label="会员套餐" collapsed={false} active={isActive('/admin/membership')} onClick={handleNavClick} />
                  <NavItem href="/admin/orders" icon="📋" label="订单管理" collapsed={false} active={isActive('/admin/orders')} onClick={handleNavClick} />
                  <NavItem href="/admin/financials" icon="💰" label="财务管理" collapsed={false} active={isActive('/admin/financials')} onClick={handleNavClick} />
                  <NavItem href="/admin/settings" icon="⚙️" label="系统设置" collapsed={false} active={isActive('/admin/settings')} onClick={handleNavClick} />
                  <Divider />
                  <NavItem href="/" icon="🏠" label="返回首页" collapsed={false} active={false} onClick={handleNavClick} />
                </>
              ) : (
                <>
                  <NavItem href="/" icon="🏠" label="首页" collapsed={false} active={isActive('/')} onClick={handleNavClick} />
                  <NavItem href="/movies?sort=rating" icon="🔥" label="热门" collapsed={false} active={isActive('/movies?sort=rating')} onClick={handleNavClick} />
                  <NavItem href="/movies?sort=year" icon="🆕" label="最新" collapsed={false} active={isActive('/movies?sort=year')} onClick={handleNavClick} />
                  <Divider />
                  {isAuthenticated && (
                    <>
                      <NavItem href="/profile" icon="👤" label="个人中心" collapsed={false} active={isActive('/profile')} onClick={handleNavClick} />
                      <NavItem href="/watchlist" icon="📋" label="我的片单" collapsed={false} active={isActive('/watchlist')} badge={watchlistCount} onClick={handleNavClick} />
                      <NavItem href="/upload" icon="📤" label="上传视频" collapsed={false} active={isActive('/upload')} onClick={handleNavClick} />
                      <Divider />
                    </>
                  )}
                  <NavItem href="/about" icon="ℹ️" label="关于" collapsed={false} active={isActive('/about')} onClick={handleNavClick} />
                  <NavItem href="/help" icon="❓" label="帮助" collapsed={false} active={isActive('/help')} onClick={handleNavClick} />
                </>
              )}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
