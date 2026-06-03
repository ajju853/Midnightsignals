import React, { useState } from "react";
import { BlogPost } from "../blogData";
import { ArrowLeft, Play, HelpCircle, Check, Quote, Volume2, Sparkles, ChevronDown, ChevronUp, Calendar, Clock, Award } from "lucide-react";
import MonetagBlogAds from "./MonetagBlogAds";

interface BlogLayoutProps {
  post: BlogPost;
  onNavigate: (path: string) => void;
  onLaunchPreset: (post: BlogPost) => void;
}

export default function BlogLayout({ post, onNavigate, onLaunchPreset }: BlogLayoutProps) {
  // Track FAQ accordion states
  const [openFaqIndices, setOpenFaqIndices] = useState<Record<number, boolean>>({
    0: true, // leave first open by default
  });

  const toggleFaq = (index: number) => {
    setOpenFaqIndices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

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

  return (
    <div className="w-full bg-zinc-950 text-zinc-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <MonetagBlogAds />
      <div className="max-w-5xl mx-auto relative z-10 space-y-8">
        {/* Back Button */}
        <button
          onClick={() => onNavigate("/blog")}
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 hover:text-white cursor-pointer transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to research index</span>
        </button>

        {/* Hero Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide border ${getCategoryStyles(
                post.category
              )}`}
            >
              {post.category}
            </span>
            <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {post.publishedDate}
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readTime}
              </span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif italic font-black text-white leading-tight tracking-tight">
            {post.headline}
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 font-sans leading-relaxed max-w-3xl">
            {post.subheading}
          </p>

          {/* Author info & E-E-A-T signals */}
          <div className="flex flex-wrap items-center gap-4 bg-zinc-900/40 p-4 rounded-xl border border-white/5 max-w-3xl">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover border border-white/10"
            />
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white block">
                  {post.author.name}
                </span>
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-1.5 py-0.5 text-[8px] font-mono font-bold tracking-widest uppercase">
                  Expert Author
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 block mt-0.5 leading-normal">
                {post.author.bio}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-mono font-bold text-zinc-300">Reviewed E-E-A-T</span>
            </div>
          </div>
        </div>

        {/* Cover Image Banner */}
        <div className="w-full h-64 sm:h-96 rounded-2xl overflow-hidden border border-white/5 relative">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-40" />
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Article Body Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Intro section */}
            <p className="text-sm sm:text-base leading-relaxed text-zinc-300 font-sans border-l-2 border-indigo-500 pl-4 py-1">
              {post.intro}
            </p>

            {/* Core Blog Sections */}
            {post.sections.map((section, idx) => (
              <div key={idx} className="space-y-4 pt-4">
                <h2 className="text-lg sm:text-xl font-serif italic font-extrabold text-white tracking-wide">
                  {section.title}
                </h2>
                {section.paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-2xs sm:text-xs leading-relaxed text-zinc-400 font-sans">
                    {p}
                  </p>
                ))}
              </div>
            ))}

            {/* Custom Comparison Table */}
            {post.comparisonTable && (
              <div className="space-y-4 pt-6">
                <h3 className="text-sm font-bold font-mono tracking-wider uppercase text-zinc-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Key Acoustic Comparison
                </h3>
                <div className="overflow-x-auto border border-white/5 rounded-xl bg-zinc-900/20">
                  <table className="w-full text-left border-collapse text-2xs sm:text-xs">
                    <thead>
                      <tr className="border-b border-white/5 bg-zinc-900/60 font-mono text-[9px] uppercase tracking-wider text-zinc-400">
                        {post.comparisonTable.headers.map((header, hIdx) => (
                          <th key={hIdx} className="p-4 font-bold">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {post.comparisonTable.rows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className="border-b border-white/5 last:border-none hover:bg-white/2"
                        >
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-4 text-zinc-300 leading-snug">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Testimonials Block */}
            {post.testimonials && post.testimonials.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                {post.testimonials.map((test, tIdx) => (
                  <div
                    key={tIdx}
                    className="p-5 bg-zinc-900/40 border border-white/5 rounded-2xl flex flex-col gap-4 relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-300"
                  >
                    <Quote className="absolute -right-2 -bottom-2 w-16 h-16 text-white/2 select-none pointer-events-none" />
                    <p className="text-2xs italic leading-relaxed text-zinc-300 font-sans z-10 flex-grow">
                      "{test.quote}"
                    </p>
                    <div className="flex items-center gap-2 z-10 border-t border-white/5 pt-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-[9px] font-bold font-mono">
                        {test.author[0]}
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-white block">
                          {test.author}
                        </span>
                        <span className="text-[8px] text-zinc-500 block uppercase font-mono">
                          {test.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FAQ Page accordions */}
            {post.faqs && post.faqs.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-white/5">
                <h3 className="text-sm font-bold font-mono tracking-wider uppercase text-zinc-200 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  Frequently Asked Questions
                </h3>
                <div className="space-y-2">
                  {post.faqs.map((faq, fIdx) => {
                    const isOpen = !!openFaqIndices[fIdx];
                    return (
                      <div
                        key={fIdx}
                        className="bg-zinc-900/30 border border-white/5 rounded-xl overflow-hidden transition-all duration-200"
                      >
                        <button
                          onClick={() => toggleFaq(fIdx)}
                          className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-white/2 transition-colors gap-3"
                        >
                          <span className="text-xs font-bold text-white font-sans leading-tight">
                            {faq.question}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 text-2xs leading-relaxed text-zinc-400 border-t border-white/5 pt-3 font-sans">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Sidebar CTA Column */}
          <div className="lg:col-span-1 lg:sticky lg:top-8 space-y-6">
            {/* The Main Launch Soundboard Card */}
            <div className="bg-gradient-to-b from-indigo-950/40 to-zinc-900/60 p-5 rounded-2xl border border-indigo-500/20 backdrop-blur-xl space-y-6 shadow-2xl relative overflow-hidden hover:border-indigo-500/35 transition-all duration-300">
              {/* Starry glow overlay */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none select-none" />

              <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-indigo-400">
                    Acoustic Preset Station
                  </span>
                </div>
                <h4 className="text-base font-serif italic font-extrabold text-white">
                  {post.presetConfig.customTitle}
                </h4>
                <p className="text-3xs text-zinc-400 font-sans leading-relaxed">
                  Synthesize this article's exact neuro-acoustic frequencies locally in your browser. Configured specifically for optimal focus and masking.
                </p>
              </div>

              {/* Station Parameters (Volumes & Waves) */}
              <div className="space-y-3.5 bg-zinc-950/80 p-4 rounded-xl border border-white/5 relative z-10">
                <span className="text-[8px] font-mono font-bold tracking-wider text-zinc-500 uppercase block mb-1">
                  Active Channel Sliders:
                </span>
                <div className="space-y-2.5">
                  {Object.entries(post.presetConfig.channelVolumes).map(([ch, vol]) => {
                    if (vol === 0) return null;
                    // Format key beautifully
                    const formattedName = ch
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase());
                    const volPercent = Math.round(vol * 100);

                    return (
                      <div key={ch} className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400">
                          <span className="flex items-center gap-1 font-sans">
                            <Volume2 className="w-3 h-3 text-indigo-400" />
                            {formattedName}
                          </span>
                          <span className="font-semibold text-zinc-200">{volPercent}%</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                          <div
                            className="bg-indigo-500 h-full rounded-full"
                            style={{ width: `${volPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Meta parameter row */}
                <div className="grid grid-cols-2 gap-2 pt-3 mt-3 border-t border-white/5 text-[9px] font-mono text-zinc-500">
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-zinc-650">Waveform</span>
                    <span className="font-bold text-zinc-300 font-mono capitalize">{post.presetConfig.synthWaveform}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-zinc-650">BPM Pulse</span>
                    <span className="font-bold text-zinc-300 font-mono">{post.presetConfig.bpm} BPM</span>
                  </div>
                </div>
              </div>

              {/* Action Launch Preset Button */}
              <button
                type="button"
                onClick={() => onLaunchPreset(post)}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-sans font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20 group relative z-10"
              >
                <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
                <span>LAUNCH PRESET CONTROLLER</span>
              </button>
            </div>

            {/* Quick trust box / biophilic badge */}
            <div className="bg-zinc-900/40 p-4 rounded-xl border border-white/5 flex gap-3">
              <Award className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-white block">
                  100% Client-Side Synthesis
                </span>
                <p className="text-[9px] text-zinc-400 leading-relaxed font-sans">
                  Unlike streaming platforms or video loops, our procedural synthesizers use the Web Audio API to create continuous soundscapes without tracking user cookies, displaying ads, or consuming mobile data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
