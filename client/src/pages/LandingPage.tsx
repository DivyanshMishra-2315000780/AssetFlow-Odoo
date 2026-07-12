import React, { useEffect, useState } from 'react';
import { ArrowRight, Box, ShieldCheck, Database, CalendarCheck, Wrench, FileSearch, Star, CheckCircle } from 'lucide-react';
import { healthService } from '../lib/api';

export default function LandingPage() {
  const [serverStatus, setServerStatus] = useState<string>('Checking connection...');

  useEffect(() => {
    healthService.ping()
      .then((res) => {
        if (res.data && res.data.success) {
          setServerStatus('Connected to Backend');
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
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground overflow-hidden">
      {/* Navbar */}
      <nav className="w-full px-8 py-6 flex justify-between items-center z-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-12">
          <div className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Box size={28} className="text-primary" fill="currentColor" /> AssetFlow
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium">
            <a href="#" className="hover:text-gray-600 transition">Categories</a>
            <a href="#" className="hover:text-gray-600 transition">Features</a>
            <a href="#" className="hover:text-gray-600 transition">About Us</a>
            <a href="#" className="hover:text-gray-600 transition">Support</a>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border border-border bg-white shadow-sm">
            <div className={`w-2 h-2 rounded-full ${serverStatus.includes('Connected') ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
            {serverStatus}
          </div>
          <a href="/login" className="bg-foreground text-background px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition shadow-md">
            Login
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center relative">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider mb-6 border border-border">
            <Star size={14} fill="currentColor" /> AssetFlow 1.0
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6">
            Simplify assets<br />for a better<br />workflow.
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-md">
            We believe the world is more beautiful as each person gets more time, 
            and knows how to implement structured asset lifecycles.
          </p>
          
          <div className="flex items-center p-2 bg-white border border-border rounded-full shadow-sm max-w-md">
            <input type="email" placeholder="Enter your email" className="flex-1 bg-transparent border-none outline-none px-4 text-sm" />
            <button className="bg-foreground text-background px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition">
              15 Days Trial
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-4 ml-4">* 30K+ Startups with 5-star rating</p>
        </div>

        {/* Hero Graphic */}
        <div className="relative h-[500px] flex justify-center items-center">
           {/* Abstract Edtech Shape Background */}
           <div className="absolute inset-0 bg-primary rounded-[100px] rounded-br-none rotate-3 scale-95 border-2 border-border shadow-lg"></div>
           
           <img 
              src="https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Professional" 
              className="absolute inset-0 w-full h-full object-cover rounded-[100px] rounded-br-none -rotate-3 border-2 border-border shadow-md"
            />

           {/* Floating Badges */}
           <div className="absolute top-12 -right-8 bg-white border border-border p-3 rounded-xl shadow-md flex items-center gap-3">
             <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-500"><Star size={20} fill="currentColor"/></div>
             <div>
               <p className="font-bold text-sm">99.24%</p>
               <p className="text-[10px] text-muted-foreground leading-tight">Total Return on<br/>Investment</p>
             </div>
           </div>

           <div className="absolute bottom-24 -left-12 bg-white border border-border p-3 rounded-xl shadow-md flex items-center gap-3">
             <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-yellow-600"><Star size={20} fill="currentColor"/></div>
             <div>
               <p className="font-bold text-sm">100%</p>
               <p className="text-[10px] text-muted-foreground leading-tight">Conflict-free<br/>Bookings</p>
             </div>
           </div>
           
           {/* Sparkle Decoration */}
           <Star className="absolute -top-6 right-12 text-foreground w-12 h-12 rotate-12 stroke-[1.5]" />
           <Star className="absolute bottom-12 left-0 text-foreground w-8 h-8 -rotate-12 stroke-[1.5]" />
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border bg-white/50">
        <div className="max-w-5xl mx-auto px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border">
          <div>
            <h3 className="text-3xl font-bold mb-1">12k+</h3>
            <p className="text-sm text-muted-foreground">Assets Tracked</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold mb-1">9+</h3>
            <p className="text-sm text-muted-foreground">Years of Experience</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold mb-1">358+</h3>
            <p className="text-sm text-muted-foreground">Enterprises</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold mb-1">47+</h3>
            <p className="text-sm text-muted-foreground">Brand Partners</p>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Popular Modules</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Design and develop an ERP where organizations can track assets through a flexible lifecycle.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            { title: 'Asset Allocations', desc: 'Double-allocation prevention', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', tag: 'BEST SELLER' },
            { title: 'Resource Bookings', desc: 'Time slot overlap validation', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', tag: 'NEW' },
            { title: 'Maintenance Routing', desc: 'Approval workflow', img: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Audit Cycles', desc: 'Discrepancy reports', img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }
          ].map((module, i) => (
            <div key={i} className="bg-white border border-border rounded-[24px] p-3 shadow-sm hover:-translate-y-2 transition-transform duration-300">
              <div className="relative h-48 rounded-xl overflow-hidden mb-4 border border-border">
                <img src={module.img} alt={module.title} className="w-full h-full object-cover" />
                {module.tag && (
                  <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-border shadow-sm">
                    {module.tag}
                  </span>
                )}
              </div>
              <div className="px-2 pb-2">
                <h3 className="font-bold text-lg leading-tight mb-2">{module.title}</h3>
                <p className="text-xs text-muted-foreground mb-4">{module.desc}</p>
                <div className="flex justify-between items-center border-t border-border pt-4">
                  <div className="flex items-center gap-1 text-xs font-bold">
                    <Star size={14} className="text-yellow-500" fill="currentColor"/> 5.0
                  </div>
                  <span className="font-bold">Included</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-12">
          <button className="bg-foreground text-background px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition">
            View All Modules
          </button>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white border-y border-border py-24">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold mb-12">Top Categories</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-secondary/40 border border-border px-8 py-4 rounded-xl flex flex-col items-center gap-3 w-48 shadow-sm">
              <div className="w-12 h-12 bg-primary rounded-full border border-border flex items-center justify-center -mb-8 z-10 translate-y-6 shadow-sm"><Box size={20}/></div>
              <span className="font-bold pb-2 pt-6">Electronics</span>
            </div>
            <div className="bg-accent/40 border border-border px-8 py-4 rounded-xl flex flex-col items-center gap-3 w-48 shadow-sm">
              <div className="w-12 h-12 bg-primary rounded-full border border-border flex items-center justify-center -mb-8 z-10 translate-y-6 shadow-sm"><Wrench size={20}/></div>
              <span className="font-bold pb-2 pt-6">Furniture</span>
            </div>
            <div className="bg-pink-100 border border-border px-8 py-4 rounded-xl flex flex-col items-center gap-3 w-48 shadow-sm">
              <div className="w-12 h-12 bg-primary rounded-full border border-border flex items-center justify-center -mb-8 z-10 translate-y-6 shadow-sm"><Database size={20}/></div>
              <span className="font-bold pb-2 pt-6">Vehicles</span>
            </div>
            <div className="bg-primary/40 border border-border px-8 py-4 rounded-xl flex flex-col items-center gap-3 w-48 shadow-sm">
              <div className="w-12 h-12 bg-primary rounded-full border border-border flex items-center justify-center -mb-8 z-10 translate-y-6 shadow-sm"><FileSearch size={20}/></div>
              <span className="font-bold pb-2 pt-6">Licenses</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / CTA */}
      <footer className="max-w-7xl mx-auto px-8 py-24 text-center relative">
        <Star className="absolute top-12 left-1/4 text-primary w-8 h-8 rotate-45 stroke-[2] fill-current" />
        <Star className="absolute top-24 right-1/4 text-secondary w-12 h-12 -rotate-12 stroke-[2] fill-current" />
        
        <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-8">
          Ready to simplify your<br/>asset management?
        </h2>
        <div className="flex justify-center gap-4">
          <a href="/signup" className="bg-foreground text-background px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition">
            Create Free Account
          </a>
          <a href="/login" className="bg-white border border-border text-foreground px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-50 transition shadow-sm">
            Sign In
          </a>
        </div>
      </footer>
    </div>
  );
}
