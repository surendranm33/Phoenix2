/**
 * Phoenix2 - Board Emulation Platform v1.0
 * Standalone React application for board emulation workflow
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Cpu,
    Factory,
    FileText,
    Settings as SettingsIcon,
    Flame,
    ChevronDown,
    Box,
    Activity
} from 'lucide-react';

import EmulationPlatform from './components/EmulationPlatform';

// Navigation Items
const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview' },
    { path: '/emulation-platform', label: 'Emulation Platform', icon: Factory, description: 'End-to-end workflow' },
    { path: '/chipset-profiles', label: 'Chipset Profiles', icon: Cpu, description: 'Vendor chipsets' },
];

// Simple Dashboard Component
function Dashboard() {
    const [status, setStatus] = useState({ available: false });
    const [chipsets, setChipsets] = useState({ total_chipsets: 0, vendors: [] });

    useEffect(() => {
        fetch('/api/v1/platform/status')
            .then(r => r.json())
            .then(setStatus)
            .catch(console.error);

        fetch('/api/v1/chipset/supported')
            .then(r => r.json())
            .then(setChipsets)
            .catch(console.error);
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-100 flex items-center">
                    <LayoutDashboard className="w-7 h-7 mr-3 text-orange-500" />
                    Dashboard
                </h1>
                <p className="text-gray-400 mt-1">Platform overview and quick actions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-gray-200 mb-2">Platform Status</h3>
                    <div className={`text-2xl font-bold ${status.available ? 'text-green-400' : 'text-red-400'}`}>
                        {status.available ? 'Online' : 'Offline'}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">Version {status.version || '1.0.0'}</p>
                </div>

                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-gray-200 mb-2">Supported Chipsets</h3>
                    <div className="text-2xl font-bold text-blue-400">
                        {chipsets.total_chipsets}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">{chipsets.vendors?.length || 0} vendors</p>
                </div>

                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-gray-200 mb-2">AI Workers</h3>
                    <div className="text-2xl font-bold text-purple-400">7</div>
                    <p className="text-gray-500 text-sm mt-1">Active workers</p>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-200 mb-4">Supported Vendors</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {['Qualcomm', 'MediaTek', 'Broadcom', 'Airoha', 'Amlogic', 'Realtek'].map(vendor => (
                        <div key={vendor} className="p-3 bg-gray-900 rounded-lg text-center">
                            <Cpu className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                            <span className="text-sm text-gray-300">{vendor}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-200 mb-4">Quick Start</h3>
                <Link
                    to="/emulation-platform"
                    className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                    <Factory className="w-5 h-5 mr-2" />
                    Start Emulation Workflow
                </Link>
            </div>
        </div>
    );
}

// Chipset Profiles Component
function ChipsetProfiles() {
    const [chipsets, setChipsets] = useState({ chipsets: [], by_vendor: {} });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/v1/chipset/supported')
            .then(r => r.json())
            .then(data => {
                setChipsets(data);
                setLoading(false);
            })
            .catch(console.error);
    }, []);

    if (loading) {
        return <div className="text-gray-400 p-4">Loading chipsets...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-100 flex items-center">
                    <Cpu className="w-7 h-7 mr-3 text-blue-500" />
                    Chipset Profiles
                </h1>
                <p className="text-gray-400 mt-1">Supported vendor chipsets for emulation</p>
            </div>

            {Object.entries(chipsets.by_vendor || {}).map(([vendor, chips]) => (
                <div key={vendor} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-gray-200 mb-4 capitalize">{vendor}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {chips.map(chip => (
                            <div key={chip.chipset_id} className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                                <h4 className="font-mono text-blue-400">{chip.chipset_id}</h4>
                                <p className="text-sm text-gray-400 mt-1">
                                    {chip.cpu_cores} cores @ {chip.cpu_frequency_mhz}MHz
                                </p>
                                <p className="text-sm text-gray-500">
                                    {chip.architecture} | {chip.ram_mb}MB RAM
                                </p>
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {chip.special_features?.slice(0, 3).map(f => (
                                        <span key={f} className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded">
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// Sidebar Navigation
function Sidebar() {
    const location = useLocation();

    return (
        <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
            <div className="h-16 flex items-center px-4 border-b border-gray-700">
                <Flame className="w-8 h-8 text-orange-500" />
                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                    PHOENIX2
                </span>
                <span className="ml-2 text-xs text-gray-500">v1.0</span>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <p className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Board Emulation
                </p>
                {navItems.map(({ path, label, icon: Icon }) => {
                    const isActive = location.pathname === path;
                    return (
                        <Link
                            key={path}
                            to={path}
                            className={`
                                flex items-center px-3 py-2 rounded-lg text-sm font-medium
                                transition-all duration-150
                                ${isActive
                                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'}
                            `}
                        >
                            <Icon className="w-5 h-5 mr-3" />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-700">
                <div className="flex items-center text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2" />
                    <span className="text-gray-400">System Online</span>
                </div>
            </div>
        </aside>
    );
}

// Header
function Header() {
    return (
        <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
            <div>
                <h1 className="text-lg font-semibold text-gray-100">
                    Board Emulation Platform
                </h1>
                <p className="text-xs text-gray-500">
                    AI-powered firmware validation and testing
                </p>
            </div>
            <div className="flex items-center space-x-4">
                <div className="px-3 py-1 rounded-full text-xs font-medium flex items-center bg-green-500/20 text-green-400">
                    <div className="w-2 h-2 rounded-full mr-2 bg-green-500" />
                    Connected
                </div>
            </div>
        </header>
    );
}

// Main Layout
function MainLayout({ children }) {
    return (
        <div className="flex h-screen bg-gray-900 text-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto p-6 bg-gray-900">
                    {children}
                </main>
            </div>
        </div>
    );
}

// App Routes
function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
            <Route path="/emulation-platform" element={<MainLayout><EmulationPlatform /></MainLayout>} />
            <Route path="/chipset-profiles" element={<MainLayout><ChipsetProfiles /></MainLayout>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

// Main App
function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}

export default App;
