import React, { useEffect, useState } from 'react';
import { ArrowRight, Box, Users, Star, CheckCircle, Shield, Filter, Database, BarChart, Settings2, ShieldCheck, CalendarCheck, Wrench, FileSearch } from 'lucide-react';
import { healthService } from '../lib/api';

export default function LandingPage() {
  const [serverStatus, setServerStatus] = useState<string>('Checking connection...');

  useEffect(() => {
    // Checking server health via actual API endpoint
    healthService.ping()
      .then((res) => {
        if (res.data && res.data.success) {
          setServerStatus('Connected to Backend API');
        } else {
          setServerStatus('API returned unexpected response');
        }
      })
      .catch((err) => {
        setServerStatus('Backend API Offline');
        console.error("Health check failed", err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#0f172a] font-sans selection:bg-blue-500 selection:text-white">
      {/* Navbar */}
      <nav className="absolute top-0 w-full px-8 py-6 flex justify-between items-center z-10 text-white font-medium text-sm">
        <div className="flex items-center gap-8">
          <div className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Box size={28} /> AssetFlow
          </div>
          <div className="hidden md:flex gap-6">
            <a href="#" className="hover:text-blue-400 transition relative">
              Dashboard
              <span className="absolute -top-1 -right-3 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            </a>
            <a href="#" className="hover:text-blue-400 transition">Modules</a>
            <a href="#" className="hover:text-blue-400 transition">About</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full mr-4">
            <div className={`w-2 h-2 rounded-full ${serverStatus.includes('Connected') ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`}></div>
            {serverStatus}
          </div>
          <a href="/login" className="bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full hover:bg-white/30 transition">
            Sign In
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full h-[90vh] min-h-[600px] overflow-hidden rounded-b-[40px]">
        {/* Background image placeholder - Abstract enterprise feel */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-600">
           <img 
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
              alt="Network" 
              className="w-full h-full object-cover mix-blend-overlay opacity-50"
            />
        </div>
        
        <div className="absolute inset-0 flex flex-col justify-center px-12 md:px-24">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-semibold text-white leading-tight mb-4">
              AssetFlow:<br/>Enterprise Asset & Resource<br/>Management System
            </h1>
            <div className="flex items-center gap-2 text-white/90">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              <p className="text-lg">Simplify and digitize how organizations track, allocate, and maintain resources.</p>
            </div>
          </div>
        </div>
        
        {/* Giant Text */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none translate-y-12">
           <h1 className="text-[15vw] font-bold text-white tracking-tighter opacity-90 pl-8">
             AssetFlow
           </h1>
        </div>
        
        {/* Floating Graphic (Simulated) */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 rounded-full overflow-hidden shadow-2xl animate-pulse">
           <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Dashboard stats" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-24 space-y-32">
        
        {/* Explore Section (Vision) */}
        <section className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold mb-4 uppercase tracking-wider">
              <ShieldCheck size={16} /> OVERALL VISION
            </div>
            <h2 className="text-5xl font-semibold leading-tight mb-8">
              Centralized 🏢 ERP <br /> platform for any industry.
            </h2>
            <div className="space-y-6">
              <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 relative group overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-black"></div>
                <h3 className="font-semibold text-xl mb-2">Reduce Manual Inefficiencies</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Replace spreadsheets and paper logs by enabling structured asset lifecycles, centralized resource booking, and real-time visibility.
                </p>
              </div>
              <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center cursor-pointer hover:border-gray-300 transition">
                <h3 className="font-medium text-lg">Real-Time Visibility</h3>
                <ArrowRight size={20} className="text-gray-400" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 relative">
            <div className="bg-white p-6 rounded-[32px] shadow-sm flex flex-col justify-between h-80 mt-12">
               <div className="flex justify-between items-start mb-4">
                 <div className="flex -space-x-2">
                   <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-blue-600"><Box size={14}/></div>
                   <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-indigo-600"><Users size={14}/></div>
                   <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center text-purple-600"><Shield size={14}/></div>
                 </div>
                 <div className="bg-gray-100 rounded-full px-3 py-1 text-xs font-medium">Core ERP</div>
               </div>
               <div>
                 <p className="text-gray-500 text-sm mb-4">Not tied to any single industry. Manage equipment, vehicles, or shared spaces easily.</p>
                 <h4 className="font-semibold text-xl mb-6">Clean<br/>Architecture</h4>
                 <button className="bg-black text-white px-6 py-3 rounded-full text-sm font-medium w-full flex justify-center hover:bg-gray-800 transition">
                   Discover Modules →
                 </button>
               </div>
            </div>
            
            <div className="relative h-80 rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
              <div className="absolute inset-0 bg-blue-50/50"></div>
              <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Server room" className="w-full h-full object-cover mix-blend-overlay" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                Secure Workflows
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-sm">
                 <div className="flex justify-between items-center mb-1">
                   <h5 className="font-bold text-lg">Role-Based</h5>
                   <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Access</span>
                 </div>
                 <p className="text-xs text-gray-600 mb-3">Scalable module design</p>
                 <button className="bg-blue-600 text-white w-full py-2 rounded-xl text-xs font-semibold">View Features</button>
              </div>
            </div>
          </div>
        </section>

        {/* Elevate Section (Mission) */}
        <section className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div className="max-w-xl">
              <div className="flex gap-4 mb-4">
                <span className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">🚀 User-Centric</span>
                <span className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">📱 Responsive UI</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-semibold leading-tight">
                Our Mission:<br />Simplify asset management.
              </h2>
            </div>
            <p className="text-gray-500 max-w-sm mt-6 md:mt-0 text-sm">
              Provide staff with intuitive tools to register assets, track lifecycles, and book shared resources without overlaps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col justify-center">
               <ul className="space-y-4 text-sm font-medium">
                 <li className="flex gap-3"><CheckCircle size={20} className="text-blue-500 shrink-0"/> Set up departments & directories</li>
                 <li className="flex gap-3"><CheckCircle size={20} className="text-blue-500 shrink-0"/> Register & track full lifecycle</li>
                 <li className="flex gap-3"><CheckCircle size={20} className="text-blue-500 shrink-0"/> Allocate assets with conflict handling</li>
                 <li className="flex gap-3"><CheckCircle size={20} className="text-blue-500 shrink-0"/> Book shared resources</li>
               </ul>
            </div>
            
            <div className="bg-[#0f172a] rounded-[32px] p-8 text-white relative overflow-hidden h-80 flex flex-col justify-between">
              <h3 className="text-2xl md:text-3xl font-medium leading-snug relative z-10 max-w-[80%]">
                Run structured 📋 maintenance approval workflows.
              </h3>
              <div className="flex justify-between items-center relative z-10">
                <span className="text-sm text-gray-400 flex items-center gap-2"><ShieldCheck size={16}/> Active Workflow</span>
                <button className="px-5 py-2 rounded-full border border-white/20 text-sm hover:bg-white/10 transition">Learn More</button>
              </div>
              {/* Subtle background glow */}
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none"></div>
            </div>

            <div className="rounded-[32px] overflow-hidden relative h-80 group">
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Analytics" className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Alerts</div>
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center text-white"><Star size={16} fill="white" /></div>
              <div className="absolute bottom-6 left-6 right-6">
                 <p className="text-white/80 text-sm mb-1">Notifications</p>
                 <h4 className="text-white text-2xl font-bold leading-tight">Overdue Returns<br/>& Bookings</h4>
              </div>
            </div>
          </div>
        </section>

        {/* Tracking Section (Problem Statement Part 1) */}
        <section className="grid md:grid-cols-2 gap-16 items-center">
           <div className="relative h-[500px] rounded-[40px] overflow-hidden bg-blue-100">
             <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="KPI Dashboard" className="w-full h-full object-cover mix-blend-multiply opacity-30" />
             
             {/* Overlay UI Card */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-xl p-6 w-[80%] max-w-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><BarChart size={16} className="text-blue-600"/></div>
                    <span className="font-semibold text-sm">KPI DASHBOARD</span>
                  </div>
                  <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded">LIVE</span>
                </div>
                <div className="mb-8">
                  <h3 className="text-4xl font-bold">142 <span className="text-sm text-gray-400 font-normal">assets</span></h3>
                  <p className="text-xs text-gray-400 mt-1">Total active allocations this week</p>
                </div>
                {/* Mock Chart Area */}
                <div className="h-24 flex items-end justify-between gap-1 mb-6">
                  {[40, 70, 45, 90, 60, 30, 80].map((h, i) => (
                    <div key={i} className="w-full bg-blue-100 rounded-t-sm relative transition-all duration-1000" style={{ height: `${h}%` }}>
                      {i === 3 && <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-100">
                   <div>
                     <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Available</p>
                     <p className="font-bold text-sm">89</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Allocated</p>
                     <p className="font-bold text-sm">42</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Maintenance</p>
                     <p className="font-bold text-sm">11</p>
                   </div>
                </div>
             </div>
           </div>
           
           <div>
              <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold mb-4 uppercase tracking-wider">
                <Database size={16} /> DATA INTEGRITY
              </div>
              <h2 className="text-4xl md:text-5xl font-semibold leading-tight mb-8">
                Surface overdue<br/>returns & maintenance 📊
              </h2>
              
              <div className="flex gap-4 mb-12">
                <button className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center hover:bg-gray-50 transition"><Filter size={20}/></button>
                <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"><Shield size={20} className="text-gray-400"/></button>
                <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"><Box size={20} className="text-gray-400"/></button>
                <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center bg-blue-600 hover:bg-blue-700 transition"><Settings2 size={20} className="text-white"/></button>
              </div>

              <div className="flex gap-8 items-end">
                <div className="flex-1">
                  <p className="text-gray-500 mb-6 leading-relaxed">Design and develop an ERP where organizations can track assets through a flexible lifecycle (Available, Allocated, Reserved, Maintenance, Lost, Retired).</p>
                  <p className="font-bold uppercase text-sm">WITH ASSETFLOW 1.0</p>
                  <button className="mt-8 w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition">
                     <ArrowRight size={24} className="-rotate-45"/>
                  </button>
                </div>
                <div className="w-48 h-48 bg-white rounded-3xl p-3 shadow-md relative group cursor-pointer overflow-hidden border border-gray-100">
                   <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Tech" className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition duration-500" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl"></div>
                   <div className="absolute bottom-6 left-6 text-white text-sm font-bold">Hardware</div>
                   <div className="absolute bottom-2 left-6 right-6 flex items-center gap-2">
                     <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                     <span className="text-white text-[10px] uppercase font-bold tracking-wider">Manage Devices</span>
                   </div>
                </div>
              </div>
           </div>
        </section>

        {/* Dark Section (Core Modules) */}
        <section className="bg-[#0a0a0a] rounded-[40px] p-8 md:p-16 text-white relative overflow-hidden">
           <div className="flex flex-col md:flex-row justify-between mb-16 gap-8">
             <div className="text-gray-400 text-sm uppercase tracking-widest font-bold">#CoreModules</div>
             <h2 className="text-4xl md:text-5xl font-semibold max-w-2xl leading-tight">
               Demonstrate proper ⚙️ ERP architecture with 🔐 secure role-based workflows.
             </h2>
           </div>

           <div className="space-y-0 border-t border-white/10">
              {[
                { title: 'Asset Allocations (Double-allocation prevention)', icon: <Users /> },
                { title: 'Resource Bookings (Time slot overlap validation)', icon: <CalendarCheck /> },
                { title: 'Maintenance Routing (Approval workflow)', icon: <Wrench /> },
                { title: 'Audit Cycles (Discrepancy reports)', icon: <FileSearch /> }
              ].map((module, index) => (
                <div key={index} className="group relative">
                  <div className="flex justify-between items-center py-6 md:py-8 border-b border-white/10 cursor-pointer relative z-10 transition-colors group-hover:bg-blue-600 px-6 -mx-6 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="text-gray-500 group-hover:text-white/80 transition-colors">
                        {module.icon}
                      </div>
                      <h3 className="text-xl md:text-2xl font-medium">{module.title}</h3>
                    </div>
                    <ArrowRight size={24} className="text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
           </div>
           {/* Decorative abstract glow */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        </section>

        {/* Footer / CTA */}
        <footer className="mt-12 mb-8 mx-6 bg-white rounded-[40px] overflow-hidden shadow-sm pt-16 pb-8 px-12 relative border border-gray-100">
           <div className="grid md:grid-cols-2 gap-16 mb-24 relative z-10">
              <div className="flex gap-6 items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg shrink-0">
                  <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Business" className="w-full h-full object-cover" />
                </div>
                <div>
                  <a href="/login" className="bg-black text-white px-6 py-2 rounded-full text-sm font-semibold mb-3 flex items-center gap-2 hover:bg-gray-800 transition inline-flex">
                    Launch Platform <ArrowRight size={16}/>
                  </a>
                </div>
              </div>
              
              <div className="flex flex-col justify-center">
                <h2 className="text-4xl md:text-5xl font-semibold leading-tight mb-8">
                  We're doing everything<br/>for organizational efficiency.
                </h2>
                <div className="flex gap-8 text-sm font-semibold">
                  <a href="#" className="hover:text-blue-600 transition">Documentation</a>
                  <a href="#" className="hover:text-blue-600 transition">API Reference</a>
                  <a href="#" className="hover:text-blue-600 transition">Support</a>
                </div>
              </div>
           </div>
           
           <div className="flex justify-between items-end border-b border-gray-200 pb-8 mb-8 relative z-10">
             <div className="flex gap-16">
               <div>
                 <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Legal</p>
                 <div className="flex flex-col gap-2 font-medium">
                   <a href="#" className="hover:text-blue-600 transition">Terms of Service</a>
                   <a href="#" className="hover:text-blue-600 transition">Privacy Policy</a>
                 </div>
               </div>
             </div>
             
             <div className="flex items-center gap-4">
               <span className="text-sm font-semibold">Ready to start?</span>
               <a href="/login" className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                 <ArrowRight size={28} className="-rotate-45" />
               </a>
             </div>
           </div>
           
           {/* Huge Footer Text */}
           <div className="w-full text-center relative z-10 overflow-hidden pt-4">
             <h1 className="text-[16vw] font-bold tracking-tighter leading-[0.8] text-black">
               AssetFlow
             </h1>
           </div>
           <div className="flex justify-between text-xs text-gray-400 font-medium mt-8 relative z-10">
             <span>© 2026 AssetFlow Inc.</span>
             <span>Enterprise Asset & Resource Management</span>
           </div>
        </footer>

      </main>
    </div>
  );
}
