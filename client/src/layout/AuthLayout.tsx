import { Outlet } from 'react-router-dom';
import { Box } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary/90 via-primary to-primary/70 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
            <Box className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">AssetFlow</h1>
          <p className="text-white/80 text-lg font-medium mb-2">Enterprise Asset Management</p>
          <p className="text-white/60 text-sm max-w-sm leading-relaxed">
            Streamline your organization's assets, bookings, maintenance workflows, and reporting in one powerful platform.
          </p>

          {/* Feature bullets */}
          <div className="mt-10 space-y-3 w-full max-w-xs">
            {[
              'Real-time asset tracking',
              'Automated maintenance alerts',
              'Role-based access control',
              'Comprehensive audit trails',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-left">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white/80 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Box className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-xl text-foreground">AssetFlow</span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
