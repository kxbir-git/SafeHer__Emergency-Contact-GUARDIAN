import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  MapPin, 
  Users, 
  AlertTriangle, 
  History, 
  Settings, 
  PhoneCall, 
  LogOut,
  Radio
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useAlertStore } from '../store/useAlertStore';

export const Sidebar = ({ onOpenFakeCall }) => {
  const { user, logout } = useAuthStore();
  const { activeAlert, guardianMode } = useAlertStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Live Map', path: '/map', icon: MapPin },
    { label: 'Emergency Contacts', path: '/contacts', icon: Users },
    { label: 'Incident Reports', path: '/reports', icon: AlertTriangle },
    { label: 'Alert History', path: '/history', icon: History },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-[#E5E7EB] bg-[#FFFFFF] flex flex-col justify-between h-screen sticky top-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#DC2626] flex items-center justify-center text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-[17px] tracking-tight text-[#111827]">SafeHer</span>
              <span className="block text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Emergency Guard</span>
            </div>
          </div>
          {guardianMode && (
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-[#DC2626] border border-red-200">
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              <span>GUARDIAN</span>
            </span>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#F3F4F6] text-[#111827]'
                      : 'text-[#6B7280] hover:bg-[#FAFAFA] hover:text-[#111827]'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-[#6B7280]" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Fake Call Escape Tool */}
        <div className="px-4 pt-2">
          <button
            onClick={onOpenFakeCall}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-[#111827] hover:bg-[#F3F4F6] transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>Escape Fake Call</span>
          </button>
        </div>
      </div>

      {/* User Section & Footer */}
      <div className="p-4 border-t border-[#E5E7EB]">
        {activeAlert && (
          <div className="mb-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs flex items-center justify-between">
            <span className="font-medium text-[#DC2626]">Alert Active ({activeAlert.type.toUpperCase()})</span>
            <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-ping" />
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 truncate">
            <div className="w-8 h-8 rounded-lg bg-[#E5E7EB] text-[#111827] font-semibold text-xs flex items-center justify-center shrink-0">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-[#111827] truncate">{user?.full_name || 'User'}</p>
              <p className="text-[11px] text-[#6B7280] truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
