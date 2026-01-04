import AlertStreamNav from '@/components/alertstream/AlertStreamNav';
import MobileNav from '@/components/alertstream/MobileNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Desktop Navigation */}
      <div className="hidden lg:block">
        <AlertStreamNav />
      </div>
      
      {/* Main Content */}
      <main className="flex-1 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
