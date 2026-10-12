import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BlogPost, BlogComment } from '../types';
import { 
  Calendar, Clock, ArrowLeft, Share2, Facebook, Twitter, MessageSquare, 
  Sparkles, ShoppingBag, Send, Check, Copy, User, BookOpen, Layers, Heart
} from 'lucide-react';
import { LanguageModeBar } from './PolicyViews';

export const BlogDetailsView: React.FC = () => {
  const { blogs, setCurrentView, viewProductDetails, products, addNotification } = useApp();

  // Comments state
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Local comments list with persistence
  const [comments, setComments] = useState<BlogComment[]>(() => {
    try {
      const stored = localStorage.getItem('pak_tajarat_blog_comments');
      return stored ? JSON.parse(stored) : [
        {
          id: 'c1',
          postId: 'faisalabad-textile-wholesale-market-guide',
          userName: 'Muhammad Usman',
          userEmail: 'usman@example.com',
          comment: 'بہت مفید گائیڈ! فیصل آباد کی ٹاٹا بازار سے خرید و فروخت کے لیے انتہائی کارآمد معلومات فراہم کی گئی ہیں۔',
          date: '2026-07-20',
          status: 'Approved'
        },
        {
          id: 'c2',
          postId: 'sialkot-sports-goods-sourcing-guide',
          userName: 'Tariq Mehmood',
          userEmail: 'tariq@example.com',
          comment: 'Very informative guide on Sialkot cricket bat sourcing grades. Thank you Pak-Tajarat team!',
          date: '2026-07-22',
          status: 'Approved'
        }
      ];
    } catch {
      return [];
    }
  });

  // Find the selected blog based on stored slug
  const blog = useMemo(() => {
    const slug = localStorage.getItem('pak_tajarat_selected_blog_slug');
    if (!slug) return null;
    return blogs?.find(b => b.slug === slug) || null;
  }, [blogs]);

  // Extract Table of Contents (H2 and H3 headings) from content
  const tableOfContents = useMemo(() => {
    if (!blog?.content) return [];
    const lines = blog.content.split('\n');
    const toc: { title: string; id: string; level: number }[] = [];
    lines.forEach(line => {
      const trimmed = line.trim();
      const md = trimmed.match(/^(#{2,3})\s*(.*)$/);
      const html = trimmed.match(/^<h([2-3])[^>]*>(.*?)<\/h\1>/i);
      if (md) {
        const level = md[1].length;
        const rawTitle = md[2].replace(/[*_#`]/g, '').trim();
        if (rawTitle) {
          toc.push({
            title: rawTitle,
            id: rawTitle.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            level
          });
        }
      } else if (html) {
        const level = parseInt(html[1], 10);
        const rawTitle = html[2].replace(/<[^>]+>/g, '').replace(/[*_#`]/g, '').trim();
        if (rawTitle) {
          toc.push({
            title: rawTitle,
            id: rawTitle.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            level
          });
        }
      }
    });
    return toc;
  }, [blog]);

  // Handle SEO metatags and Structured JSON-LD Data Injection
  useEffect(() => {
    if (!blog) return;

    // 1. Dynamic Title & Description
    document.title = `${blog.metaTitle || blog.title} | Pak-Tajarat Blog`;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', blog.metaDescription || blog.excerpt);

    // 2. Structured JSON-LD Schema.org Data Injection (BlogPosting Schema)
    const existingScript = document.getElementById('blog-article-jsonld');
    if (existingScript) existingScript.remove();

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": blog.canonicalUrl || `https://paktajarat.pk/blog/${blog.slug}`
      },
      "headline": blog.metaTitle || blog.title,
      "description": blog.metaDescription || blog.excerpt,
      "image": [blog.coverImage || "https://paktajarat.pk/logo.png"],
      "datePublished": blog.date,
      "dateModified": blog.date,
      "author": {
        "@type": "Person",
        "name": blog.author || "Pak-Tajarat Editorial",
        "jobTitle": blog.authorTitle || "Market Specialist"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Pak-Tajarat",
        "logo": {
          "@type": "ImageObject",
          "url": "https://paktajarat.pk/logo.png"
        }
      },
      "keywords": blog.metaKeywords || blog.focusKeyword || "e-commerce pakistan"
    };

    const script = document.createElement('script');
    script.id = 'blog-article-jsonld';
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('blog-article-jsonld');
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [blog?.slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [blog?.slug]);

  if (!blog) {
    return (
      <div className="pt-32 pb-20 text-center space-y-4 max-w-md mx-auto min-h-screen flex flex-col justify-center text-left px-4">
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl border border-red-100 dark:border-red-950/40 text-center">
          <h2 className="font-extrabold text-sm text-red-700 dark:text-red-400">Article Not Found</h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">This blog article does not exist or has been removed.</p>
        </div>
        <button
          onClick={() => setCurrentView('blog')}
          className="w-full py-2.5 bg-[#0F9D58] hover:bg-[#0b8043] text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1"
        >
          <ArrowLeft size={13} />
          <span>Back to Blog Directory</span>
        </button>
      </div>
    );
  }

  // Filter comments for current post
  const currentPostComments = comments.filter(c => c.postId === blog.slug || c.postId === blog.id);

  // Submit comment handler
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) {
      addNotification('Comment Error', 'Please enter your name and comment message.', 'warning');
      return;
    }

    const newComment: BlogComment = {
      id: `c-${Date.now()}`,
      postId: blog.slug,
      userName: commentName.trim(),
      userEmail: commentEmail.trim(),
      comment: commentText.trim(),
      date: new Date().toISOString().split('T')[0],
      status: 'Approved'
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    try {
      localStorage.setItem('pak_tajarat_blog_comments', JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save comment to localStorage", e);
    }

    addNotification('Comment Posted', 'Thank you! Your comment has been published.', 'success');
    setCommentName('');
    setCommentEmail('');
    setCommentText('');
  };

  // Related Blogs filter
  const relatedBlogs = blogs
    ?.filter(b => b.isPublished && b.id !== blog.id && (b.category === blog.category || b.language === blog.language))
    .slice(0, 3) || [];

  // Custom Markdown parser with internal link and markdown table support
  const renderBlogContent = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');

    const renderInlineFormattedText = (lineText: string, lineIndex: number) => {
      if (!lineText) return null;

      // Regex matching markdown links [label](url), bold **text**, italic *text*, underline <u>text</u>, inline code `text`
      const tokenRegex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|<u>([^<]+)<\/u>|`([^`]+)`)/g;
      const elements: React.ReactNode[] = [];
      let lastIdx = 0;
      let match: RegExpExecArray | null;

      while ((match = tokenRegex.exec(lineText)) !== null) {
        if (match.index > lastIdx) {
          elements.push(lineText.substring(lastIdx, match.index));
        }

        if (match[2] && match[3]) {
          // Markdown Link [label](url)
          const label = match[2];
          const url = match[3];

          const prodMatch = url.match(/\/products\/([a-zA-Z0-9_-]+)/) || url.match(/\/p([0-9]+)/);
          const targetProdId = prodMatch ? (prodMatch[1].startsWith('p') ? prodMatch[1] : `p${prodMatch[1]}`) : null;

          // Check if link is a blog post link /blog/slug
          const blogSlugMatch = url.match(/\/blog\/([a-zA-Z0-9_-]+)/);

          if (targetProdId && products.some(p => p.id === targetProdId)) {
            elements.push(
              <button
                key={`link-${lineIndex}-${match.index}`}
                onClick={(e) => {
                  e.preventDefault();
                  viewProductDetails(targetProdId);
                }}
                className="inline-flex items-center text-[#0F9D58] hover:text-[#0b8043] font-extrabold underline cursor-pointer bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50 hover:scale-105 transition-all mx-1"
                title="View Product Details"
              >
                <span>{label}</span>
                <ShoppingBag size={11} className="ml-1 text-[#0F9D58]" />
              </button>
            );
          } else if (blogSlugMatch) {
            const targetSlug = blogSlugMatch[1];
            elements.push(
              <button
                key={`link-${lineIndex}-${match.index}`}
                onClick={(e) => {
                  e.preventDefault();
                  localStorage.setItem('pak_tajarat_selected_blog_slug', targetSlug);
                  setCurrentView('blog-details');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center text-[#0F9D58] hover:text-[#0b8043] font-bold underline cursor-pointer hover:scale-105 transition-all mx-1"
                title="Read Article"
              >
                <span>{label}</span>
              </button>
            );
          } else if (url.includes('/products')) {
            elements.push(
              <button
                key={`link-${lineIndex}-${match.index}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView('products');
                }}
                className="inline-flex items-center text-[#0F9D58] hover:text-[#0b8043] font-bold underline cursor-pointer hover:scale-105 transition-all mx-1"
              >
                <span>{label}</span>
              </button>
            );
          } else if (url === '/' || url.endsWith('paktajarat.pk/')) {
            elements.push(
              <button
                key={`link-${lineIndex}-${match.index}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView('home');
                }}
                className="inline-flex items-center text-[#0F9D58] hover:text-[#0b8043] font-bold underline cursor-pointer hover:scale-105 transition-all mx-1"
              >
                <span>{label}</span>
              </button>
            );
          } else if (url.includes('/about')) {
            elements.push(
              <button
                key={`link-${lineIndex}-${match.index}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView('about');
                }}
                className="inline-flex items-center text-[#0F9D58] hover:text-[#0b8043] font-bold underline cursor-pointer hover:scale-105 transition-all mx-1"
              >
                <span>{label}</span>
              </button>
            );
          } else if (url.includes('/contact')) {
            elements.push(
              <button
                key={`link-${lineIndex}-${match.index}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView('contact');
                }}
                className="inline-flex items-center text-[#0F9D58] hover:text-[#0b8043] font-bold underline cursor-pointer hover:scale-105 transition-all mx-1"
              >
                <span>{label}</span>
              </button>
            );
          } else if (url.includes('/blog')) {
            elements.push(
              <button
                key={`link-${lineIndex}-${match.index}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView('blog');
                }}
                className="inline-flex items-center text-[#0F9D58] hover:text-[#0b8043] font-bold underline cursor-pointer hover:scale-105 transition-all mx-1"
              >
                <span>{label}</span>
              </button>
            );
          } else if (url.includes('/faq')) {
            elements.push(
              <button
                key={`link-${lineIndex}-${match.index}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView('faq');
                }}
                className="inline-flex items-center text-[#0F9D58] hover:text-[#0b8043] font-bold underline cursor-pointer hover:scale-105 transition-all mx-1"
              >
                <span>{label}</span>
              </button>
            );
          } else if (url.includes('/privacy')) {
            elements.push(
              <button
                key={`link-${lineIndex}-${match.index}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView('privacy');
                }}
                className="inline-flex items-center text-[#0F9D58] hover:text-[#0b8043] font-bold underline cursor-pointer hover:scale-105 transition-all mx-1"
              >
                <span>{label}</span>
              </button>
            );
          } else if (url.includes('/terms')) {
            elements.push(
              <button
                key={`link-${lineIndex}-${match.index}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView('terms');
                }}
                className="inline-flex items-center text-[#0F9D58] hover:text-[#0b8043] font-bold underline cursor-pointer hover:scale-105 transition-all mx-1"
              >
                <span>{label}</span>
              </button>
            );
          } else if (url.includes('/refund')) {
            elements.push(
              <button
                key={`link-${lineIndex}-${match.index}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView('refund');
                }}
                className="inline-flex items-center text-[#0F9D58] hover:text-[#0b8043] font-bold underline cursor-pointer hover:scale-105 transition-all mx-1"
              >
                <span>{label}</span>
              </button>
            );
          } else if (url.includes('/affiliate')) {
            elements.push(
              <button
                key={`link-${lineIndex}-${match.index}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView('affiliate-status');
                }}
                className="inline-flex items-center text-[#0F9D58] hover:text-[#0b8043] font-bold underline cursor-pointer hover:scale-105 transition-all mx-1"
              >
                <span>{label}</span>
              </button>
            );
          } else {
            elements.push(
              <a
                key={`link-${lineIndex}-${match.index}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0F9D58] hover:underline font-bold mx-1"
              >
                {label}
              </a>
            );
          }
        } else if (match[4]) {
          // Bold **text**
          elements.push(
            <strong key={`bld-${lineIndex}-${match.index}`} className="font-extrabold text-gray-900 dark:text-white">
              {match[4]}
            </strong>
          );
        } else if (match[5]) {
          // Italic *text*
          elements.push(
            <em key={`it-${lineIndex}-${match.index}`} className="italic text-gray-700 dark:text-zinc-200">
              {match[5]}
            </em>
          );
        } else if (match[6]) {
          // Underline <u>text</u>
          elements.push(
            <u key={`un-${lineIndex}-${match.index}`} className="underline underline-offset-2">
              {match[6]}
            </u>
          );
        } else if (match[7]) {
          // Inline code `text`
          elements.push(
            <code key={`cd-${lineIndex}-${match.index}`} className="bg-gray-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] px-1.5 py-0.5 rounded">
              {match[7]}
            </code>
          );
        }

        lastIdx = tokenRegex.lastIndex;
      }

      if (lastIdx < lineText.length) {
        elements.push(lineText.substring(lastIdx));
      }

      return elements.length > 0 ? elements : lineText;
    };

    return lines.map((line, index) => {
      const trimmed = line.trim();

      // Markdown Image (![alt](url))
      const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        const altText = imgMatch[1] || 'Blog Image';
        const imgUrl = imgMatch[2];
        return (
          <figure key={index} className="my-6 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 shadow-sm">
            <img 
              src={imgUrl} 
              alt={altText} 
              className="w-full h-auto max-h-[480px] object-cover rounded-xl"
              loading="lazy" 
            />
            {altText && (
              <figcaption className="text-center text-[11px] text-gray-500 dark:text-zinc-400 py-2 px-3 italic">
                {altText}
              </figcaption>
            )}
          </figure>
        );
      }

      // Headings 1 - 4 (Markdown #, ##, ###, #### or HTML <h1>, <h2>, <h3>, <h4>)
      const mdHeading = trimmed.match(/^(#{1,4})\s*(.*)$/);
      const htmlHeading = trimmed.match(/^<h([1-4])[^>]*>(.*?)<\/h\1>$/i);

      if (mdHeading || htmlHeading) {
        const level = mdHeading ? mdHeading[1].length : parseInt(htmlHeading![1], 10);
        const headingRawText = mdHeading ? mdHeading[2] : htmlHeading![2];
        const headingCleanText = headingRawText.replace(/<[^>]+>/g, '').trim();
        const headingId = headingCleanText.toLowerCase().replace(/[^a-z0-9]/g, '-');

        if (level === 1) {
          return (
            <h1 id={headingId} key={index} className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-10 mb-5 border-b-2 border-[#0F9D58]/30 pb-3">
              {renderInlineFormattedText(headingRawText, index)}
            </h1>
          );
        }
        if (level === 2) {
          return (
            <h2 id={headingId} key={index} className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-8 mb-4 border-b border-gray-100 dark:border-zinc-800 pb-2.5 scroll-mt-24">
              {renderInlineFormattedText(headingRawText, index)}
            </h2>
          );
        }
        if (level === 3) {
          return (
            <h3 id={headingId} key={index} className="text-base sm:text-lg font-black text-gray-900 dark:text-white mt-6 mb-3 scroll-mt-24">
              {renderInlineFormattedText(headingRawText, index)}
            </h3>
          );
        }
        if (level === 4) {
          return (
            <h4 id={headingId} key={index} className="text-sm sm:text-base font-bold text-[#0F9D58] mt-5 mb-2 scroll-mt-24">
              {renderInlineFormattedText(headingRawText, index)}
            </h4>
          );
        }
      }

      // Bullet Lists (- or *)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <ul key={index} className="list-disc pl-6 my-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            <li className="pl-1">{renderInlineFormattedText(trimmed.slice(2), index)}</li>
          </ul>
        );
      }

      // Numbered Lists (1. )
      const numMatch = trimmed.match(/^(\d+)\.\s(.*)$/);
      if (numMatch) {
        return (
          <ol key={index} className="list-decimal pl-6 my-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            <li className="pl-1">{renderInlineFormattedText(numMatch[2], index)}</li>
          </ol>
        );
      }

      // Markdown Table Row (| col1 | col2 |)
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
        const isHeaderDivider = cells.every(c => /^:?-+:?$/.test(c));
        if (isHeaderDivider) return null;

        return (
          <div key={index} className="overflow-x-auto my-3">
            <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-zinc-900 p-3 rounded-xl border border-gray-100 dark:border-zinc-800 text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
              {cells.map((cell, cIdx) => (
                <div key={cIdx} className="px-2 py-1">
                  {renderInlineFormattedText(cell, index * 100 + cIdx)}
                </div>
              ))}
            </div>
          </div>
        );
      }

      // Blockquotes (> text)
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={index} className="border-l-4 border-[#0F9D58] pl-4 italic my-5 text-xs sm:text-sm text-gray-600 dark:text-gray-300 bg-emerald-50/50 dark:bg-zinc-950 p-4 rounded-r-2xl">
            {renderInlineFormattedText(trimmed.slice(2), index)}
          </blockquote>
        );
      }

      // Empty line
      if (trimmed === '') {
        return <div key={index} className="h-3" />;
      }

      return (
        <p key={index} className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
          {renderInlineFormattedText(line, index)}
        </p>
      );
    });
  };

  // Social Share Action
  const shareArticle = (platform: 'whatsapp' | 'facebook' | 'twitter' | 'copy') => {
    const articleUrl = `https://paktajarat.pk/blog/${blog.slug}`;
    const text = `Read "${blog.title}" on Pak-Tajarat Blog:\n${articleUrl}`;

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(articleUrl)}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(articleUrl);
      setCopiedLink(true);
      addNotification('Link Copied', 'Article permalink copied to clipboard.', 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="w-full pb-16 space-y-8 animate-in fade-in duration-300 text-left" id="blog-details-view">
      
      {/* Control bar */}
      <LanguageModeBar />

      {/* Top Breadcrumb & Share Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('blog')}
          className="flex items-center space-x-1.5 text-xs font-black text-gray-500 hover:text-[#0F9D58] transition-all cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Blog Hub</span>
        </button>
        
        {/* Social Sharing Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => shareArticle('whatsapp')}
            className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-black flex items-center space-x-1 hover:bg-emerald-100 transition-all cursor-pointer"
            title="Share on WhatsApp"
          >
            <Share2 size={13} />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
          
          <button
            onClick={() => shareArticle('facebook')}
            className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-black flex items-center space-x-1 hover:bg-blue-100 transition-all cursor-pointer"
            title="Share on Facebook"
          >
            <Facebook size={13} />
            <span className="hidden sm:inline">Facebook</span>
          </button>

          <button
            onClick={() => shareArticle('copy')}
            className="p-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-black flex items-center space-x-1 hover:bg-gray-200 transition-all cursor-pointer"
            title="Copy Permalink"
          >
            {copiedLink ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Article Main Frame */}
      <article className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
        
        {/* Title Header Section */}
        <div className="p-6 sm:p-10 space-y-4">
          
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400 font-bold">
            <span className="bg-[#0F9D58]/10 text-[#0F9D58] font-black px-2.5 py-1 rounded-md uppercase tracking-wide">
              {blog.category}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {blog.readTime}</span>
            <span>•</span>
            <span className="bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-gray-500">
              {blog.language === 'ur' ? 'اردو (Urdu)' : blog.language === 'en' ? 'English' : 'Urdu & English'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
            {blog.title}
          </h1>

          {/* Author Credits Box */}
          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <img
                src={blog.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                alt={blog.author}
                className="w-10 h-10 rounded-full object-cover border border-emerald-500/30"
                referrerPolicy="no-referrer"
              />
              <div className="text-left">
                <p className="text-xs font-black text-gray-900 dark:text-white">Written by {blog.author}</p>
                <p className="text-[10px] text-gray-400">{blog.authorTitle || 'Pak-Tajarat Market Analyst'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-gray-400 font-bold font-mono uppercase bg-gray-50 dark:bg-zinc-950 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-zinc-800 shrink-0">
              <Calendar size={13} className="text-[#0F9D58]" />
              <span>{blog.date}</span>
            </div>
          </div>

        </div>

        {/* Cover Photo */}
        <div className="w-full aspect-video bg-gray-100 dark:bg-zinc-950 border-y border-gray-100 dark:border-zinc-800 relative">
          <img
            src={blog.coverImage || 'https://images.unsplash.com/photo-1542744094-3a31b272c490?auto=format&fit=crop&w=1200&q=80'}
            alt={blog.coverImageAlt || blog.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          {blog.coverImageCaption && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-3 py-1 rounded-lg backdrop-blur-sm max-w-lg">
              {blog.coverImageCaption}
            </div>
          )}
        </div>

        {/* Article Body */}
        <div className="p-6 sm:p-10 text-left space-y-8">
          
          {/* Table of Contents (if H2 / H3 headings exist) */}
          {tableOfContents.length > 0 && (
            <div className="p-5 bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 rounded-2xl space-y-2.5">
              <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                <BookOpen size={14} className="text-[#0F9D58]" />
                <span>Table of Contents (مندرجات)</span>
              </h4>
              <ul className="space-y-1.5 pl-4 text-xs font-bold">
                {tableOfContents.map((item, idx) => (
                  <li 
                    key={idx} 
                    className={item.level === 3 ? "pl-4 list-circle text-gray-600 dark:text-zinc-400 font-medium" : "list-disc text-[#0F9D58]"}
                  >
                    <a href={`#${item.id}`} className="hover:underline">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Render Content */}
          <div className="prose dark:prose-invert max-w-none">
            {renderBlogContent(blog.content)}
          </div>

          {/* Sourcing CTA Conversion Card */}
          <div className="p-6 bg-gradient-to-r from-emerald-500/10 to-green-600/10 border border-[#0F9D58]/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 bg-[#0F9D58] text-white font-black text-[9px] uppercase rounded-md tracking-wider inline-block">
                Pak-Tajarat B2B Wholesale Hub
              </span>
              <h4 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                Start Sourcing Direct Factory Products Across Pakistan
              </h4>
              <p className="text-xs text-gray-500 max-w-lg">
                Connect with verified manufacturers in Lahore, Karachi, Sialkot, and Faisalabad. Cash on delivery available nationwide.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('products')}
              className="px-5 py-3 bg-[#0F9D58] hover:bg-[#0b8043] text-white text-xs font-black rounded-2xl transition-all shadow-md flex items-center space-x-2 shrink-0 cursor-pointer"
            >
              <ShoppingBag size={14} />
              <span>Explore Product Catalog</span>
            </button>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 flex flex-wrap gap-2 items-center">
              <span className="text-[10px] text-gray-400 font-extrabold uppercase">Indexed Tags:</span>
              {blog.tags.map((t, idx) => (
                <span
                  key={idx}
                  onClick={() => setCurrentView('blog')}
                  className="px-3 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 text-[10px] font-mono rounded-lg hover:text-[#0F9D58] transition-colors cursor-pointer"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

        </div>

      </article>

      {/* ========================================================= */}
      {/* WORDPRESS INTERACTIVE COMMENTS & DISCUSSION SECTION */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
        
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center space-x-2">
            <MessageSquare size={18} className="text-[#0F9D58]" />
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              Discussion ({currentPostComments.length})
            </h3>
          </div>
          <span className="text-xs text-gray-400 font-mono">Approved Reader Comments</span>
        </div>

        {/* Comment Form */}
        <form onSubmit={handleAddComment} className="bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Leave a Reply / Share Your Feedback
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Your Name (Required)"
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#0F9D58]"
              required
            />
            <input
              type="email"
              placeholder="Your Email (Optional)"
              value={commentEmail}
              onChange={(e) => setCommentEmail(e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#0F9D58]"
            />
          </div>
          <textarea
            placeholder="Write your comment or question regarding this article..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-gray-900 dark:text-white placeholder-gray-400 h-24 focus:outline-none focus:border-[#0F9D58]"
            required
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#0F9D58] hover:bg-[#0b8043] text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
          >
            <Send size={13} />
            <span>Post Comment</span>
          </button>
        </form>

        {/* Comments List */}
        <div className="space-y-4 pt-2">
          {currentPostComments.length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-4">
              No comments yet. Be the first to share your thoughts on this article!
            </p>
          ) : (
            currentPostComments.map((c) => (
              <div key={c.id} className="p-4 bg-gray-50/60 dark:bg-zinc-950/60 border border-gray-100 dark:border-zinc-800/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 bg-emerald-500/20 text-[#0F9D58] font-bold text-xs rounded-full flex items-center justify-center">
                      {c.userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{c.userName}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">{c.date}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed pl-9">
                  {c.comment}
                </p>
              </div>
            ))
          )}
        </div>

      </div>

      {/* RELATED ARTICLES */}
      {relatedBlogs.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-base font-black text-gray-900 dark:text-white">Related Sourcing Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedBlogs.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  localStorage.setItem('pak_tajarat_selected_blog_slug', item.slug);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setCurrentView('home');
                  setTimeout(() => setCurrentView('blog-details'), 10);
                }}
                className="group bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4 rounded-2xl shadow-xs hover:shadow-md cursor-pointer transition-all space-y-3"
              >
                <img
                  src={item.coverImage}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-32 rounded-xl object-cover bg-gray-100 dark:bg-zinc-950"
                />
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#0F9D58] uppercase">{item.category}</span>
                  <h4 className="text-xs font-black text-gray-900 dark:text-white line-clamp-2 group-hover:text-[#0F9D58] transition-colors">
                    {item.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
