import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { bookService } from "../../services/bookService";
import { categoryService } from "../../services/categoryService";
import {
  UsersIcon,
  ArrowLeftRightIcon,
  CheckCircleIcon,
  BookmarkIcon,
  SearchIcon,
  SparklesIcon,
  StarIcon
} from "../../components/Icons";

export default function LandingPage() {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [booksData, catsData] = await Promise.all([
          bookService.getAll().catch(() => []),
          categoryService.getAll().catch(() => []),
        ]);
        const booksList = Array.isArray(booksData) ? booksData : [];
        const catsList = Array.isArray(catsData) ? catsData : [];
        const featured = booksList.filter((b) => b.featured).slice(0, 4);
        setFeaturedBooks(featured.length > 0 ? featured : booksList.slice(0, 4));
        setCategories(catsList.slice(0, 6));
      } catch (e) {
        console.error("Failed to load landing page data", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/explore");
    }
  };

  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Looping Video Hero Section with High Visibility */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950">
        {/* Real Looping Background Video */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1920&auto=format&fit=crop"
          className="absolute inset-0 w-full h-full object-cover opacity-75 sm:opacity-80 scale-105 filter contrast-105"
        >
          <source
            src={process.env.PUBLIC_URL + "/videos/library-study.webm"}
            type="video/webm"
          />
          <source
            src="https://assets.mixkit.co/videos/45831/45831-720.mp4"
            type="video/mp4"
          />
          <source
            src="https://assets.mixkit.co/videos/50726/50726-720.mp4"
            type="video/mp4"
          />
          <source
            src="https://assets.mixkit.co/videos/48574/48574-720.mp4"
            type="video/mp4"
          />
        </video>

        {/* Ambient Gradient Overlay: Balanced so video is clearly visible while text has optimal contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/40 to-slate-950/80 pointer-events-none" />

        {/* Hero Foreground Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 py-12 sm:py-16">
          {/* MasterClass / Harvard Style Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-snug max-w-2xl mx-auto drop-shadow-lg">
            Knowledge Preserved. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-200 to-amber-200">
              Instantly Accessible.
            </span>
          </h1>

          <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-slate-200 max-w-xl mx-auto leading-relaxed font-normal drop-shadow-md">
            Welcome to <span className="text-white font-semibold">SmartLibrary</span>. Seamlessly explore our curated catalog, request borrow approvals in real-time, join waitlists for popular books, and track reading history.
          </p>

          {/* Floating Search Bar */}
          <form onSubmit={handleHeroSearch} className="mt-6 sm:mt-8 max-w-xl mx-auto">
            <div className="bg-slate-900/80 backdrop-blur-xl p-1.5 sm:p-2 rounded-2xl border border-white/20 shadow-2xl flex flex-col sm:flex-row items-center gap-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30 transition">
              <div className="flex items-center w-full px-3 gap-2">
                <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 5,000+ books by title, author, or ISBN..."
                  className="w-full bg-transparent border-none text-white placeholder-slate-400 focus:outline-none text-xs sm:text-sm py-1.5 sm:py-2"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl transition duration-200 shadow-lg shadow-indigo-600/40 whitespace-nowrap"
              >
                Search Catalog
              </button>
            </div>
          </form>

          {/* Primary Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/explore"
              className="w-full sm:w-auto px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
            >
              Browse All Collections &rarr;
            </Link>
            <Link
              to="/signup"
              className="w-full sm:w-auto px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white bg-slate-900/70 hover:bg-slate-900/90 backdrop-blur-md rounded-xl border border-white/20 transition"
            >
              Create Free Member Account
            </Link>
          </div>

          {/* Glassmorphic Metrics Strip */}
          <div className="mt-10 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
            <div className="bg-slate-900/70 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 text-center hover:bg-slate-900/90 transition shadow-xl">
              <p className="text-3xl font-black text-white tracking-tight">5,000+</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Curated Titles</p>
            </div>
            <div className="bg-slate-900/70 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 text-center hover:bg-slate-900/90 transition shadow-xl">
              <p className="text-3xl font-black text-emerald-400 tracking-tight">98.4%</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Available In Stock</p>
            </div>
            <div className="bg-slate-900/70 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 text-center hover:bg-slate-900/90 transition shadow-xl">
              <p className="text-3xl font-black text-indigo-400 tracking-tight">Instant</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Digital Approvals</p>
            </div>
            <div className="bg-slate-900/70 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 text-center hover:bg-slate-900/90 transition shadow-xl">
              <p className="text-3xl font-black text-amber-400 tracking-tight">Smart</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Waitlist & Alerts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Life at SmartLibrary: Students, Books & Modern Study Environments */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-2 border border-indigo-500/20">
              <SparklesIcon className="w-3.5 h-3.5 text-indigo-500" />
              Campus & Reading Culture
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Life Inside SmartLibrary
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Where curious minds gather. Experience quiet research carrels, team study pods, rare manuscript archives, and vibrant reading culture.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 bg-slate-100 px-4 py-2 rounded-2xl border border-slate-200">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 1,200 Quiet Study Desks</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> 50K Physical Volumes</span>
          </div>
        </div>

        {/* Dynamic Visual Photo Showcase Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Photo 1: Students Studying */}
          <div className="group relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-200/90 shadow-md hover:shadow-2xl transition-all duration-300">
            <div className="h-64 sm:h-72 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=900&auto=format&fit=crop"
                alt="Students studying together in modern academic library"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700 filter brightness-95 group-hover:brightness-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent flex flex-col justify-end p-6">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Collaborative Learning</span>
              <h4 className="text-lg font-bold text-white mt-0.5">Students Deep in Research</h4>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">High-speed digital reference terminals, open collaboration tables, and charging hubs at every desk.</p>
            </div>
          </div>

          {/* Photo 2: Towering Bookcases */}
          <div className="group relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-200/90 shadow-md hover:shadow-2xl transition-all duration-300">
            <div className="h-64 sm:h-72 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1507842229451-7f01be7fe7ab?q=80&w=900&auto=format&fit=crop"
                alt="Grand library wooden bookshelves filled with classical literature"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700 filter brightness-95 group-hover:brightness-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent flex flex-col justify-end p-6">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Archival Wings</span>
              <h4 className="text-lg font-bold text-white mt-0.5">Grand Classical Stacks</h4>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">Spanning multiple wings with organized Dewey Decimal and LC cataloging for effortless physical discovery.</p>
            </div>
          </div>

          {/* Photo 3: Open Hardcover Book */}
          <div className="group relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-200/90 shadow-md hover:shadow-2xl transition-all duration-300">
            <div className="h-64 sm:h-72 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=900&auto=format&fit=crop"
                alt="Open book on wooden table in library reading room"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700 filter brightness-95 group-hover:brightness-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent flex flex-col justify-end p-6">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Rare Manuscripts</span>
              <h4 className="text-lg font-bold text-white mt-0.5">Preserved Literary Works</h4>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">First editions, historical chronicles, and preserved scientific journals available for on-premise study.</p>
            </div>
          </div>

          {/* Photo 4: Quiet Study Window Nook */}
          <div className="group relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-200/90 shadow-md hover:shadow-2xl transition-all duration-300">
            <div className="h-64 sm:h-72 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=900&auto=format&fit=crop"
                alt="Sunlit silent study desk with books"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700 filter brightness-95 group-hover:brightness-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent flex flex-col justify-end p-6">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Silent Study Zone</span>
              <h4 className="text-lg font-bold text-white mt-0.5">Sunlit Reading Carrels</h4>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">Natural sunlight and whisper-quiet zones dedicated for uninterrupted thesis work and deep reading.</p>
            </div>
          </div>

          {/* Photo 5: Group Discussion Pods */}
          <div className="group relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-200/90 shadow-md hover:shadow-2xl transition-all duration-300">
            <div className="h-64 sm:h-72 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=900&auto=format&fit=crop"
                alt="Students collaborating around a study pod with books and laptops"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700 filter brightness-95 group-hover:brightness-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent flex flex-col justify-end p-6">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Team Spaces</span>
              <h4 className="text-lg font-bold text-white mt-0.5">Collaborative Seminar Pods</h4>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">Acoustically treated rooms reserveable by members for group projects, debate prep, and peer code reviews.</p>
            </div>
          </div>

          {/* Photo 6: Digital & Hybrid Archives */}
          <div className="group relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-200/90 shadow-md hover:shadow-2xl transition-all duration-300">
            <div className="h-64 sm:h-72 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=900&auto=format&fit=crop"
                alt="Digital research archives and reference books"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700 filter brightness-95 group-hover:brightness-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent flex flex-col justify-end p-6">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Hybrid Resources</span>
              <h4 className="text-lg font-bold text-white mt-0.5">Digital & Physical Stacks</h4>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">State-of-the-art document digitizers and instant remote eBook checkouts alongside traditional hardcovers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
              <SparklesIcon className="w-4 h-4 text-amber-500" />
              Librarian Curated
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Featured Selections
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Handpicked bestsellers, academic landmarks, and trending reading recommendations.
            </p>
          </div>
          <Link
            to="/explore"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition"
          >
            <span>View Complete Catalog</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-4 border border-slate-200 animate-pulse h-96"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBooks.map((book) => {
              const isAvailable = (book.availableCopies || 0) > 0;
              const coverImg = book.image?.startsWith("http")
                ? book.image
                : book.image
                ? `http://localhost:8081${book.image}`
                : "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop";

              return (
                <div
                  key={book.id}
                  className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    {/* Book Cover Container */}
                    <div className="h-64 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                      <img
                        src={coverImg}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop";
                        }}
                      />

                      {/* In-Stock / Availability Pill */}
                      <span
                        className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm border ${
                          isAvailable
                            ? "bg-emerald-500/90 text-white border-emerald-400/30"
                            : "bg-amber-500/90 text-white border-amber-400/30"
                        }`}
                      >
                        {isAvailable ? `${book.availableCopies} Available` : "Waitlist Only"}
                      </span>
                    </div>

                    {/* Book Details */}
                    <div className="p-5">
                      <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                        {book.categoryName || book.category?.name || "General Literature"}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition truncate" title={book.title}>
                        {book.title}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 mt-1">
                        By {book.authorName || book.author?.name || "Unknown Author"}
                      </p>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                        {book.description || "No synopsis available for this volume."}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Link
                      to={`/explore?book=${book.id}`}
                      className="w-full block text-center py-2.5 text-xs font-bold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 rounded-xl transition duration-200"
                    >
                      View Details & Reserve &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Explore Disciplines & Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-1">Diverse Subjects</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Explore Categories</h2>
          <p className="text-slate-500 text-sm mt-1">Browse our wide catalog organized across academic and popular genres.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/explore?category=${cat.id}`}
              className="bg-white p-5 rounded-3xl border border-slate-200/90 text-center hover:border-indigo-500 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-600 group-hover:text-white transition duration-300 shadow-sm">
                <BookmarkIcon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition truncate">
                {cat.name}
              </h4>
              <span className="text-[11px] text-slate-400 block mt-0.5">Explore Titles &rarr;</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works Section - Modern 3-Step Timeline */}
      <section id="how-it-works" className="bg-slate-950 text-white py-16 sm:py-24 rounded-3xl max-w-7xl mx-auto px-6 sm:px-12 border border-slate-800/80 shadow-2xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 border border-emerald-500/20">
            Streamlined Borrowing Lifecycle
          </div>
          <h3 className="text-3xl sm:text-5xl font-black tracking-tight">
            How Digital Lending Works
          </h3>
          <p className="text-slate-400 text-sm sm:text-base mt-4">
            Borrowing books from SmartLibrary is seamless and fully automated from initial search to final return.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900/90 p-8 rounded-3xl border border-slate-800 flex flex-col items-center text-center hover:border-indigo-500/50 transition duration-300">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-6 border border-indigo-500/30 shadow-inner">
              <UsersIcon className="w-8 h-8" />
            </div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Step 01</span>
            <h4 className="text-xl font-bold text-white mb-2">Create Reader Profile</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Sign up in seconds. Instant secure authentication with encrypted credentials and immediate access to borrow requests.
            </p>
          </div>

          <div className="bg-slate-900/90 p-8 rounded-3xl border border-slate-800 flex flex-col items-center text-center hover:border-emerald-500/50 transition duration-300">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-6 border border-emerald-500/30 shadow-inner">
              <ArrowLeftRightIcon className="w-8 h-8" />
            </div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Step 02</span>
            <h4 className="text-xl font-bold text-white mb-2">Search & Request Loan</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Find any book by title, author, or category. Submit a single-click borrow request or queue in line if copies are in circulation.
            </p>
          </div>

          <div className="bg-slate-900/90 p-8 rounded-3xl border border-slate-800 flex flex-col items-center text-center hover:border-amber-500/50 transition duration-300">
            <div className="w-16 h-16 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-6 border border-amber-500/30 shadow-inner">
              <CheckCircleIcon className="w-8 h-8" />
            </div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Step 03</span>
            <h4 className="text-xl font-bold text-white mb-2">Track & Return</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Monitor active loan countdowns in your dashboard, receive automatic return notifications, and renew in one click.
            </p>
          </div>
        </div>
      </section>

      {/* Modern Reader Testimonials / Trust Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-8 sm:p-14 rounded-3xl text-white border border-white/10 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-2">
                Trusted by 3,000+ Readers
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Empowering Minds Through Accessible Books
              </h3>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                Whether you're a student conducting research or an avid reader discovering timeless fiction, our catalog is built for you.
              </p>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4" filled={true} />
                  ))}
                </div>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
                  "The digital waitlist system is incredible. As soon as a borrowed research text was returned, I got notified immediately."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">
                    AK
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Ananya K.</p>
                    <p className="text-[10px] text-slate-400">Computer Science Student</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4" filled={true} />
                  ))}
                </div>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
                  "Managing book loans and returns used to take forever. Now with SmartLibrary, everything from approvals to fines is clear."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold">
                    RM
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Rahul M.</p>
                    <p className="text-[10px] text-slate-400">Literature Scholar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
