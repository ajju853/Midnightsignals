import React, { useState, useMemo } from "react";
import { Search, BookOpen, Clock, Calendar, ArrowRight, X, AlertCircle } from "lucide-react";
import { BLOG_POSTS, BlogPost } from "../blogData";
import MonetagBlogAds from "./MonetagBlogAds";

interface BlogIndexProps {
  onNavigate: (path: string) => void;
}

export default function BlogIndex({ onNavigate }: BlogIndexProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo(() => {
    const list = new Set(BLOG_POSTS.map((post) => post.category));
    return ["All", ...Array.from(list)];
  }, []);

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.metaDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case "Rain & Sleep":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "Birdsong & Rest":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Lofi Science & Focus":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Meditation & Healing":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Forest & Wind":
        return "bg-teal-500/10 text-teal-400 border-teal-500/20";
      default:
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    }
  };

  const handleCardClick = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    onNavigate(`/blog/${slug}`);
  };

  return (
    <div className="w-full bg-zinc-950 text-zinc-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      <MonetagBlogAds />
      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>MIDNIGHT JOURNAL &amp; RESEARCH</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif italic font-black text-white tracking-tight leading-none">
            The Science of Ambient Sound
          </h1>
          <p className="text-base text-zinc-400 font-sans leading-relaxed">
            Exploring the neuro-acoustic architecture, cognitive science, and biophilic resonance behind rain, nature, and generative beats.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-zinc-900/60 p-4 rounded-2xl border border-white/5 backdrop-blur-xl flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto py-1 scrollbar-none snap-x">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 snap-start px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                      : "bg-zinc-950/50 hover:bg-zinc-800 border border-white/5 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search research logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/80 border border-white/5 focus:border-indigo-500/40 rounded-xl py-2 pl-10 pr-9 text-xs focus:outline-none transition-all placeholder-zinc-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Grid of Articles */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <article
                key={post.slug}
                onClick={(e) => handleCardClick(e, post.slug)}
                className="group bg-zinc-900/40 border border-white/5 hover:border-zinc-700/50 hover:-translate-y-1 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col h-full shadow-lg hover:shadow-[0_12px_30px_-5px_rgba(99,102,241,0.08)]"
              >
                {/* Cover Image Wrapper */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-60" />
                  
                  {/* Category Pill */}
                  <span
                    className={`absolute top-4 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wide border ${getCategoryStyles(
                      post.category
                    )}`}
                  >
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow justify-between gap-4">
                  <div className="space-y-2">
                    {/* Date and Reading Time */}
                    <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.publishedDate}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-zinc-750" />
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-base font-serif italic font-extrabold text-white group-hover:text-indigo-400 transition-colors leading-tight line-clamp-2">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-2xs text-zinc-400 leading-relaxed font-sans line-clamp-3">
                      {post.metaDescription}
                    </p>
                  </div>

                  {/* Author Card Footer */}
                  <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-7 h-7 rounded-full object-cover border border-white/10"
                      />
                      <div>
                        <span className="text-[10px] font-semibold text-zinc-300 block">
                          {post.author.name}
                        </span>
                        <span className="text-[8px] text-zinc-500 block uppercase font-mono tracking-wider">
                          Author
                        </span>
                      </div>
                    </div>

                    <span className="p-1.5 rounded-lg bg-white/5 text-zinc-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-zinc-900/20 border border-white/5 rounded-2xl space-y-3">
            <AlertCircle className="w-8 h-8 text-zinc-650 mx-auto" />
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
              No matching records found
            </h3>
            <p className="text-2xs text-zinc-550 max-w-sm mx-auto leading-relaxed">
              We couldn't find any research logs matching "{searchQuery}" under "{selectedCategory}". Try updating your query or selecting another channel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
