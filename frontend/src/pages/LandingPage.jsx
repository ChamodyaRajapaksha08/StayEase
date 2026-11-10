import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertyApi, publicStatsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import {
  Home,
  Building2,
  Users,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  Bed,
  ArrowRight,
  Sun,
  TrendingUp,
  X,
  Github,
  Linkedin,
  Youtube,
  Twitter,
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, logout } = useAuth();

  // State
  const [themeDark, setThemeDark] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [properties, setProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [propertiesError, setPropertiesError] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchLandingData = async () => {
      try {
        const [propertiesResult, statsResult] = await Promise.allSettled([
          propertyApi.getPublic(),
          publicStatsApi.get(),
        ]);

        if (!active) return;

        if (propertiesResult.status === 'fulfilled' && Array.isArray(propertiesResult.value.data)) {
          setProperties(propertiesResult.value.data);
        } else {
          setPropertiesError(true);
        }

        if (statsResult.status === 'fulfilled' && statsResult.value.data) {
          setStats(statsResult.value.data);
        } else {
          setStatsError(true);
        }
      } finally {
        if (active) {
          setPropertiesLoading(false);
          setStatsLoading(false);
        }
      }
    };

    fetchLandingData();
    return () => {
      active = false;
    };
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen font-sans ${themeDark ? 'bg-slate-900 text-slate-100' : 'bg-[#F9FBFA] text-[#11231E]'}`}>
      {/* Dynamic Background Waves matching the design reference */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top-left soft mint glow */}
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] bg-gradient-to-br from-emerald-100/50 via-teal-50/40 to-transparent rounded-full blur-3xl" />
        {/* Mid-right organic soft mint wave */}
        <div className="absolute top-[280px] -right-28 w-[720px] h-[600px] bg-gradient-to-bl from-emerald-100/40 via-teal-100/30 to-transparent rounded-full blur-3xl" />
        {/* Bottom wave */}
        <div className="absolute bottom-10 -left-20 w-[600px] h-[500px] bg-gradient-to-tr from-emerald-100/35 via-teal-50/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* =========================================================================
          1. NAVIGATION BAR
      ========================================================================= */}
      <header className="relative z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100/80 sticky top-0 transition-all">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 h-20 flex items-center justify-between">
          {/* Logo on the left */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#0D644E] flex items-center justify-center text-white font-black text-2xl shadow-sm group-hover:bg-[#0A4E3C] transition-all">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-[#0F2820] leading-none mb-1">
                StayEase
              </span>
              <span className="text-[10px] text-[#5E736B] uppercase font-bold tracking-widest leading-none">
                SMART PROPERTY CLOUD
              </span>
            </div>
          </Link>

          {/* Navigation Links in Center */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-[#0D644E] font-semibold relative py-1 after:content-[''] after:block after:w-5 after:h-0.5 after:bg-[#0D644E] after:rounded-full after:mx-auto after:mt-1"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('featured-properties')}
              className="hover:text-[#0D644E] transition-colors py-1"
            >
              Properties
            </button>
            <button
              onClick={() => scrollToSection('stakeholder-workflows')}
              className="hover:text-[#0D644E] transition-colors py-1"
            >
              Tenants
            </button>
            <button
              onClick={() => scrollToSection('stakeholder-workflows')}
              className="hover:text-[#0D644E] transition-colors py-1"
            >
              Requests
            </button>
            <button
              onClick={() => scrollToSection('stats-overview')}
              className="hover:text-[#0D644E] transition-colors py-1"
            >
              Analytics
            </button>
            <button
              onClick={() => scrollToSection('about-section')}
              className="hover:text-[#0D644E] transition-colors py-1"
            >
              About
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme toggle icon button */}
            <button
              onClick={() => setThemeDark(!themeDark)}
              className="w-9 h-9 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-2xs"
              title="Toggle theme"
            >
              {themeDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Sun className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#0D644E] hover:bg-[#0A4E3C] rounded-full transition-all shadow-sm flex items-center gap-1.5"
                >
                  Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-rose-600"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#0D644E] hover:bg-[#0A4E3C] rounded-full transition-all shadow-sm shadow-emerald-950/10"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-sm font-semibold text-[#0D644E] border border-[#0D644E] hover:bg-emerald-50/80 rounded-full transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION
      ========================================================================= */}
      <section className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 pt-8 pb-20 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Heading, description, CTA buttons, feature highlights */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start text-left">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5F7EE] text-[#0D644E] text-xs font-semibold mb-6 border border-emerald-200/60 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#0D644E]"></span>
              Next-Generation Hostel & Apartment Management
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[46px] xl:text-[52px] font-extrabold text-[#11231E] leading-[1.12] tracking-tight">
              Manage Hostels, Apartments &amp; Tenancies with{' '}
              <span className="text-[#0D8763]">Effortless Precision.</span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
              The centralized SaaS platform for property owners, property managers, and student/residential tenants.
              From room assignments and automated occupancy to rent collection and repair tracking.
            </p>

            {/* CTA Button Row */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-full bg-[#0D644E] hover:bg-[#0A4E3C] text-white text-sm font-semibold shadow-md shadow-emerald-950/15 flex items-center gap-2 transition-all group"
              >
                Start Free as Owner or Tenant{' '}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

            </div>

            {/* 4 Feature Highlights with Icons */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-8 border-t border-slate-200/60">
              {/* Highlight 1 */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E5F7EE] text-[#0D644E] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#11231E] leading-tight">
                  Multi-Property<br />Scoping
                </span>
              </div>

              {/* Highlight 2 */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E5F7EE] text-[#0D644E] flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#11231E] leading-tight">
                  Real-time Bed<br />Allocation
                </span>
              </div>

              {/* Highlight 3 */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E5F7EE] text-[#0D644E] flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#11231E] leading-tight">
                  Role-Based<br />Spring Security
                </span>
              </div>

              {/* Highlight 4 */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E5F7EE] text-[#0D644E] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#11231E] leading-tight">
                  Printable Rent<br />Receipts
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero photograph with organic mint backdrop & floating stat cards */}
          <div className="lg:col-span-6 xl:col-span-6 relative flex justify-center items-center">
            {/* Organic mint shape behind the building matching reference image */}
            <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-tr from-[#C6F0DE]/60 via-[#E3F8EE]/70 to-[#EAFBF3]/40 rounded-[42px] -rotate-1 pointer-events-none transform scale-95" />

            {/* Main Building Photograph */}
            <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl border-4 border-white/90 z-10">
              <img
                src="/images/hero-building.jpg"
                alt="StayEase Modern Multi-Property Apartment Building"
                className="w-full h-[380px] sm:h-[460px] lg:h-[500px] object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating Card 1: Total Properties (Top-Right) */}
            <div id="stats-overview" className="absolute -top-4 -right-2 sm:-right-4 lg:-top-6 lg:-right-6 z-20 bg-white rounded-2xl shadow-xl shadow-slate-300/60 p-3.5 sm:p-4 border border-slate-100 flex items-center gap-3.5 backdrop-blur-md animate-fade-in">
              <div className="w-11 h-11 rounded-xl bg-[#E5F7EE] text-[#0D644E] flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Total Properties</span>
                <span className="text-2xl font-black text-slate-900 leading-none block mt-1" aria-live="polite">
                  {statsLoading ? '...' : statsError ? '—' : stats?.totalProperties ?? '—'}
                </span>
              </div>
            </div>

            {/* Floating Card 2: Active Tenants (Bottom-Right) */}
            <div className="absolute bottom-6 -right-2 sm:-right-4 lg:bottom-10 lg:-right-6 z-20 bg-white rounded-2xl shadow-xl shadow-slate-300/60 p-3.5 sm:p-4 border border-slate-100 flex items-center gap-3.5 backdrop-blur-md animate-fade-in">
              <div className="w-11 h-11 rounded-xl bg-[#E5F7EE] text-[#0D644E] flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Active Tenants</span>
                <span className="text-2xl font-black text-slate-900 leading-none block mt-1" aria-live="polite">
                  {statsLoading ? '...' : statsError ? '—' : stats?.activeTenants ?? '—'}
                </span>
              </div>
            </div>
            {statsError && (
              <p role="alert" className="absolute -bottom-5 left-0 right-0 text-center text-xs text-rose-700">
                Live statistics are unavailable.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. FEATURED PROPERTIES SECTION
      ========================================================================= */}
      <section id="featured-properties" className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 py-12">
        {/* Section Header */}
        <div className="relative text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0D8763] block">
            — OUR PROPERTIES —
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#11231E] mt-1">
            Explore Featured Properties
          </h2>

          <Link
            to="/login"
            className="hidden sm:inline-flex items-center gap-1 absolute right-0 top-1/2 -translate-y-1/2 text-xs font-bold text-[#0D644E] hover:text-[#0A4E3C] transition-colors"
          >
            View All Properties <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {propertiesLoading ? (
          <p className="py-12 text-center text-sm text-slate-500">Loading properties...</p>
        ) : propertiesError ? (
          <p role="alert" className="py-12 text-center text-sm text-rose-700">
            Properties are unavailable right now. Please try again later.
          </p>
        ) : properties.length === 0 ? (
          <div className="py-12 text-center">
            <Building2 className="w-10 h-10 mx-auto text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">No properties are listed yet.</p>
            <p className="mt-1 text-xs text-slate-500">Check back later for available properties.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.map((prop) => (
              <div
                key={prop.id}
                className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="relative overflow-hidden rounded-xl h-44 w-full bg-slate-100">
                    <ImageWithFallback
                      src={prop.imageUrl}
                      alt={prop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs bg-[#E5F7EE] text-[#0D644E]">
                        {prop.type?.replace(/_/g, ' ') || 'Property'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 px-1">
                    <h3 className="font-bold text-base text-[#11231E] line-clamp-1 group-hover:text-[#0D644E] transition-colors">
                      {prop.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{prop.address || prop.city || 'Location not provided'}</span>
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-600 mt-3 py-2.5 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{prop.totalRooms ?? 0} Rooms</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-slate-400" />
                        <span>{prop.availableRooms ?? 0} Available</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 px-1 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedProperty(prop)}
                    className="text-xs font-bold text-[#0D644E] hover:text-[#0A4E3C] inline-flex items-center gap-1 hover:underline"
                  >
                    View Details <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          4. STAKEHOLDER WORKFLOWS SECTION
      ========================================================================= */}
      <section id="stakeholder-workflows" className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 py-14">
        {/* Section Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0D8763] block">
            — WORK SMARTER —
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#11231E] mt-1">
            Dedicated Workflows for All Stakeholders
          </h2>
        </div>

        {/* 4 Stakeholder Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Workflow 1: Property Owners */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#11231E]">Property Owners</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Manage your properties, track performance, and grow your business.
              </p>
            </div>
          </div>

          {/* Workflow 2: Property Managers */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#D1FAE5] text-[#059669] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#11231E]">Property Managers</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Handle operations, tenants and maintenance efficiently.
              </p>
            </div>
          </div>

          {/* Workflow 3: Tenants */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#11231E]">Tenants</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Find rooms, pay rent, and submit requests with ease.
              </p>
            </div>
          </div>

          {/* Workflow 4: Service Providers */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#11231E]">Service Providers</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Offer services, receive requests, and manage your work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. FOOTER
      ========================================================================= */}
      <footer id="about-section" className="relative z-10 w-full bg-[#0D2B22] text-slate-300 py-6 border-t border-emerald-950/40">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          {/* Left: Branding */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0F5E4B] flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
              S
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <span>StayEase</span>
              <span className="text-slate-400 font-normal">| Smart Property Cloud</span>
            </div>
          </div>

          {/* Center: Copyright & Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-slate-300">
            <span>© 2026 StayEase. Built with <span className="text-rose-500">❤️</span> in Sri Lanka.</span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <button onClick={() => alert('StayEase Privacy Policy: Your data and property records are encrypted and protected under strict tenant confidentiality.')} className="hover:text-white transition-colors">
              Privacy Policy
            </button>
            <span className="text-slate-500">|</span>
            <button onClick={() => alert('StayEase Terms of Service: Standard software licensing and property management terms apply.')} className="hover:text-white transition-colors">
              Terms of Service
            </button>
            <span className="text-slate-500">|</span>
            <button onClick={() => alert('StayEase Support: contact@stayease.com | Hotline: +94 11 234 5678')} className="hover:text-white transition-colors">
              Contact
            </button>
          </div>

          {/* Right: Social Media Icons */}
          <div className="flex items-center gap-4 text-slate-300">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="GitHub">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="LinkedIn">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="YouTube">
              <Youtube className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="Twitter / X">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          PROPERTY DETAILS MODAL
      ========================================================================= */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl relative border border-slate-100 flex flex-col max-h-[90vh]">
            {/* Header Image */}
            <div className="relative h-60 w-full overflow-hidden bg-slate-100 flex-shrink-0">
              <ImageWithFallback
                src={selectedProperty.imageUrl}
                alt={selectedProperty.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProperty(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4">
                <span className="bg-[#E5F7EE] text-[#0D644E] text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                  {selectedProperty.type?.replace(/_/g, ' ') || 'Property'}
                </span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{selectedProperty.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedProperty.address || selectedProperty.city || 'Location not provided'}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-center text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Rooms</span>
                  <span className="font-extrabold text-slate-800 text-sm">{selectedProperty.totalRooms ?? 0}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Available Rooms</span>
                  <span className="font-extrabold text-slate-800 text-sm">{selectedProperty.availableRooms ?? 0}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">Property Overview</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedProperty.description || 'No description available.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Close
                </button>
                <Link
                  to="/login"
                  className="px-5 py-2.5 bg-[#0D644E] hover:bg-[#0A4E3C] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  Sign in to Book Room <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
