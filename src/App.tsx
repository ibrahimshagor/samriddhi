import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { Login } from './pages/Login';

// 17 Main Pages
import { DashboardOverview } from './pages/DashboardOverview';
import { MultiInstitutionManagement } from './pages/MultiInstitutionManagement';
import { InstitutionsView } from './pages/InstitutionsView';
import { BranchManagement } from './pages/BranchManagement';
import { StaffAndManagers } from './pages/StaffAndManagers';
import { CustomerDirectory } from './pages/CustomerDirectory';
import { PaymentChannels } from './pages/PaymentChannels';
import { AssetInvestments } from './pages/AssetInvestments';
import { InstitutionalBorrowings } from './pages/InstitutionalBorrowings';
import { PackageSchemes } from './pages/PackageSchemes';
import { SupportComplaints } from './pages/SupportComplaints';
import { ReportsAudit } from './pages/ReportsAudit';
import { WebsiteSettings } from './pages/WebsiteSettings';
import { ProfileSettings } from './pages/ProfileSettings';
import { UserManagement } from './pages/UserManagement';
import { KycForm } from './pages/KycForm';
import { AdjustmentRequests } from './pages/AdjustmentRequests';

const AppContent: React.FC = () => {
  const { currentUser } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  if (!currentUser) {
    return <Login />;
  }

  // Active Menu Content Dispatcher
  const renderPageContent = () => {
    // Check if subcategory is under asset_investment (inv_*)
    if (activeMenu.startsWith('inv_')) {
      const subcat = activeMenu.replace('inv_', '');
      return <AssetInvestments activeSubcategory={subcat} />;
    }

    // Check if subcategory is under packages (pkg_*)
    if (activeMenu.startsWith('pkg_')) {
      const subcat = activeMenu.replace('pkg_', '');
      return <PackageSchemes activeSubcategory={subcat} />;
    }

    switch (activeMenu) {
      case 'dashboard':
        return <DashboardOverview onNavigate={setActiveMenu} />;
      case 'multi_institution':
        return <MultiInstitutionManagement />;
      case 'institutions':
        return <InstitutionsView />;
      case 'branch_management':
        return <BranchManagement />;
      case 'staff_managers':
        return <StaffAndManagers />;
      case 'customer_directory':
        return <CustomerDirectory onNavigate={setActiveMenu} />;
      case 'payment_channels':
        return <PaymentChannels />;
      case 'asset_investment':
        return <AssetInvestments />;
      case 'borrowings':
        return <InstitutionalBorrowings />;
      case 'packages':
        return <PackageSchemes />;
      case 'complaints':
        return <SupportComplaints />;
      case 'reports':
        return <ReportsAudit />;
      case 'website_settings':
        return <WebsiteSettings />;
      case 'profile':
        return <ProfileSettings />;
      case 'user_management':
        return <UserManagement />;
      case 'kyc_form':
        return <KycForm />;
      case 'adjustment_requests':
        return <AdjustmentRequests />;
      default:
        return <DashboardOverview onNavigate={setActiveMenu} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 py-6 gap-6 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />

        <main className="flex-1 min-w-0 pb-12">
          {renderPageContent()}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
