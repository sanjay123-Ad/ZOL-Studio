import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { User } from '../types';
import { supabase } from '../services/supabase';
import { getCreditInfo, CreditInfo } from '../services/creditService';
import { 
    VirtualPhotoshootIcon, AssetGeneratorIcon, ProductForgeIcon, StyleSceneIcon, PoseMimicIcon,
    GalleryIcon, PricingIcon, SettingsIcon, ProfileIcon, LogoutIcon, UsageAnalyticsIcon
} from './icons';
import { PATHS } from '../constants/paths';

interface SidebarProps {
    user: User;
    onLogout: (e?: React.MouseEvent) => void;
    isCollapsed: boolean;
    closeMobileSidebar: () => void;
}

const NavItem: React.FC<{
    to: string;
    icon: React.ReactElement;
    label: string;
    isCollapsed: boolean;
    onClick?: () => void;
}> = ({ to, icon, label, isCollapsed, onClick }) => {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            title={label}
            className={({ isActive }) => `relative group w-full flex items-center py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                isActive
                ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
            } ${isCollapsed ? 'justify-center' : 'px-4'}`}
        >
            <div className={`w-6 h-6 ${!isCollapsed ? 'mr-4' : ''}`}>{icon}</div>
            {!isCollapsed && <span className="truncate">{label}</span>}
            {isCollapsed && (
                                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20">
                                    {label}
                                </div>
            )}
        </NavLink>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, isCollapsed, closeMobileSidebar }) => {
    const [planStatus, setPlanStatus] = useState<'inactive' | 'active' | 'past_due' | 'canceled'>('inactive');
    const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);

    // Load subscription status and credits
    useEffect(() => {
        const loadData = async () => {
            try {
                const [profileData, credits] = await Promise.all([
                    supabase
                        .from('profiles')
                        .select('plan_status')
                        .eq('id', user.id)
                        .limit(1)
                        .single(),
                    getCreditInfo(user.id)
                ]);
                
                if (profileData.data?.plan_status) {
                    setPlanStatus(profileData.data.plan_status);
                }
                if (credits) {
                    setCreditInfo(credits);
                }
            } catch (err) {
                // Ignore errors, default to inactive
            }
        };

        if (user?.id) {
            loadData();
        }
    }, [user?.id]);

    // Set up real-time subscription for credit updates
    useEffect(() => {
        if (!user?.id) return;

        const channel = supabase
            .channel(`sidebar-credits:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${user.id}`,
                },
                async () => {
                    // Refresh credit info when profile is updated
                    const credits = await getCreditInfo(user.id);
                    if (credits) {
                        setCreditInfo(credits);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    const coreFeatures = [
        { path: PATHS.VIRTUAL_PHOTOSHOOT, icon: <VirtualPhotoshootIcon />, label: 'Virtual Photoshoot' },
        { path: PATHS.STYLE_SCENE, icon: <StyleSceneIcon />, label: 'StyleScene' },
        { path: PATHS.ASSET_GENERATOR, icon: <AssetGeneratorIcon />, label: 'Asset Generator' },
        { path: PATHS.CATALOG_FORGED, icon: <ProductForgeIcon />, label: 'Catalog Forged' },
        { path: PATHS.POSE_MIMIC, icon: <PoseMimicIcon />, label: 'AI Pose Mimic' },
    ];
    
    const utilityNav = [
        { path: PATHS.GALLERY, icon: <GalleryIcon />, label: 'My Gallery' },
        { path: PATHS.ASSET_COLLECTION, icon: <AssetGeneratorIcon />, label: 'Asset Collection' },
    ];

    const adminNav = [
        { path: PATHS.USAGE_ANALYTICS, icon: <UsageAnalyticsIcon />, label: 'Usage Analytics' },
        { path: PATHS.PRICING, icon: <PricingIcon />, label: 'Pricing & Usage' },
        { path: PATHS.PROFILE, icon: <ProfileIcon />, label: 'Profile' },
        { path: PATHS.SETTINGS, icon: <SettingsIcon />, label: 'Settings' },
    ];


    return (
        <>
            <style>{`
                .sidebar-scrollbar {
                    scrollbar-width: thick;
                    scrollbar-color: #0ea5e9 #f1f5f9;
                }
                
                .dark .sidebar-scrollbar {
                    scrollbar-color: #0ea5e9 #1f2937;
                }
                
                .sidebar-scrollbar::-webkit-scrollbar {
                    width: 14px;
                }
                
                .sidebar-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 7px;
                    margin: 4px 0;
                }
                
                .dark .sidebar-scrollbar::-webkit-scrollbar-track {
                    background: #1f2937;
                }
                
                .sidebar-scrollbar::-webkit-scrollbar-thumb {
                    background: #0ea5e9;
                    border-radius: 7px;
                    border: 2px solid #f1f5f9;
                    min-height: 40px;
                }
                
                .dark .sidebar-scrollbar::-webkit-scrollbar-thumb {
                    border-color: #1f2937;
                }
                
                .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #0284c7;
                }
                
                .sidebar-scrollbar::-webkit-scrollbar-button {
                    display: none;
                }
            `}</style>
            <aside className={`flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col p-4 h-full transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <Link 
              to={PATHS.HOME}
              onClick={closeMobileSidebar}
              className={`mb-8 px-2 h-auto flex items-center cursor-pointer gap-3 hover:opacity-80 transition-opacity ${isCollapsed ? 'justify-center' : ''}`} 
            >
                <img src="/logo.png" alt="Zol Studio AI" className="h-10 w-10 md:h-12 md:w-12 object-contain flex-shrink-0" />
                {!isCollapsed && (
                    <div className="flex flex-col justify-center min-w-0 flex-1">
                        <span className="font-black text-xl text-slate-900 dark:text-white tracking-tight leading-none whitespace-nowrap">Zol Studio AI</span>
                        <span className="text-[10px] font-extrabold text-sky-600 dark:text-sky-400 tracking-[0.25em] uppercase mt-1 whitespace-nowrap">Creative Platform</span>
                    </div>
                )}
            </Link>
            
            <nav className="flex-grow space-y-1 overflow-y-auto overflow-x-hidden sidebar-scrollbar pr-2">
                {!isCollapsed && <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">STUDIO</p>}
                {coreFeatures.map(item => (
                    <NavItem key={item.path} to={item.path} isCollapsed={isCollapsed} onClick={closeMobileSidebar} {...item} />
                ))}

                <div className={`${isCollapsed ? 'mt-4' : 'pt-6'}`}>
                    {!isCollapsed && <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">LIBRARY</p>}
                    {utilityNav.map(item => (
                       <NavItem key={item.path} to={item.path} isCollapsed={isCollapsed} onClick={closeMobileSidebar} {...item} />
                    ))}
                </div>

                <div className={`${isCollapsed ? 'mt-4' : 'pt-6'}`}>
                    {!isCollapsed && <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">ADMIN</p>}
                    {adminNav.map(item => (
                       <NavItem key={item.path} to={item.path} isCollapsed={isCollapsed} onClick={closeMobileSidebar} {...item} />
                    ))}
                </div>
            </nav>

            <div className="mt-auto space-y-3">
                {/* Credits Section */}
                {!isCollapsed && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">CREDITS</p>
                            {creditInfo && creditInfo.availableCredits === 0 && (
                                <span className="text-xs font-bold text-red-500 dark:text-red-400">Empty!</span>
                            )}
                        </div>
                        {creditInfo ? (
                            <>
                                <div className={`text-2xl font-bold mb-3 ${
                                    creditInfo.availableCredits === 0 
                                        ? 'text-red-500 dark:text-red-400' 
                                        : 'text-gray-900 dark:text-white'
                                }`}>
                                    {creditInfo.availableCredits} / {creditInfo.totalCredits} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">total</span>
                                </div>
                                <Link
                                    to={PATHS.PRICING}
                                    onClick={closeMobileSidebar}
                                    className="w-full bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                >
                                    Get More Credits
                                </Link>
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-bold mb-3 text-red-500 dark:text-red-400">
                                    0 / 0 <span className="text-sm font-normal text-gray-500 dark:text-gray-400">total</span>
                                </div>
                                <Link
                                    to={PATHS.PRICING}
                                    onClick={closeMobileSidebar}
                                    className="w-full bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                >
                                    Get More Credits
                                </Link>
                            </>
                        )}
                    </div>
                )}

                {/* User Avatar Section */}
                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                    <div className={`flex items-center ${isCollapsed ? 'flex-col' : ''}`}>
                        <div className="relative group">
                            {/* Green badge ring for active subscriptions */}
                            {planStatus === 'active' && (
                                <div className="absolute -inset-1 rounded-full bg-green-500 opacity-75 animate-pulse"></div>
                            )}
                            <div className={`relative ${planStatus === 'active' ? 'ring-2 ring-green-500' : ''} rounded-full`}>
                                {user.avatar ? (
                                    <img 
                                        src={user.avatar} 
                                        alt="User avatar" 
                                        className={`w-10 h-10 rounded-full ${planStatus === 'active' ? 'border-2 border-green-500' : ''}`}
                                        title={isCollapsed ? user.username : undefined}
                                    />
                                ) : (
                                    <div className={`w-10 h-10 rounded-full bg-sky-100 ${planStatus === 'active' ? 'border-2 border-green-500' : ''} flex items-center justify-center`}>
                                        <svg className="w-6 h-6 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            {/* Active badge indicator */}
                            {planStatus === 'active' && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                            )}
                            {isCollapsed && user.avatar && (
                                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20">
                                    {user.username}
                                </div>
                            )}
                        </div>

                        {!isCollapsed && (
                            <div className="ml-3">
                                <p className="text-sm font-bold text-gray-800 dark:text-white">{user.username}</p>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onLogout(e);
                                    }}
                                    className="text-xs text-red-400 dark:text-red-500 hover:text-red-300 dark:hover:text-red-400 font-semibold flex items-center transition-colors mt-1"
                                    type="button"
                                >
                                    <div className="w-3 h-3 mr-1"><LogoutIcon /></div>
                                    Sign Out
                                </button>
                            </div>
                        )}
                        
                        {isCollapsed && (
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onLogout(e);
                                }} 
                                title="Sign Out" 
                                className="relative group mt-3 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                type="button"
                            >
                                <div className="w-5 h-5"><LogoutIcon /></div>
                                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20">
                                    Sign Out
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </aside>
        </>
    );
};

export default Sidebar;
