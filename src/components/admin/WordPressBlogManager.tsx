import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BlogPost } from '../../types';
import { 
  FileText, Plus, Search, Filter, Edit3, Trash2, Eye, Sparkles, 
  CheckCircle2, AlertTriangle, X, Globe, Calendar, Clock, Image, 
  Tag, Folder, User, Share2, Code, ArrowUpRight, Copy, Check, Star,
  TrendingUp, MessageSquare, Layers, HelpCircle, ExternalLink, RefreshCw, Upload, FileUp, Save, RotateCcw,
  Heading1, Heading2, Heading3, Heading4, Heading, Bold, Italic, Underline, List, ListOrdered, Quote, Link as LinkIcon, Type
} from 'lucide-react';
import { optimizeAndUploadImage } from '../../utils/imageOptimizer';

export const WordPressBlogManager: React.FC = () => {
  const { blogs, products, addBlog, updateBlog, deleteBlog, addNotification } = useApp();

  // Filter & Search states for the Post Table
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedLang, setSelectedLang] = useState<string>('All');

  // Modal / Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [initialBlogSnapshot, setInitialBlogSnapshot] = useState<BlogPost | null>(null);

  // WordPress Post Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Business Guides');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [author, setAuthor] = useState('Pak-Tajarat Editorial');
  const [authorTitle, setAuthorTitle] = useState('Senior Market Analyst');
  const [authorAvatar, setAuthorAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
  const [coverImage, setCoverImage] = useState('');
  const [coverImageAlt, setCoverImageAlt] = useState('');
  const [coverImageCaption, setCoverImageCaption] = useState('');
  const [status, setStatus] = useState<'Published' | 'Draft' | 'Scheduled'>('Published');
  const [scheduledDate, setScheduledDate] = useState('');
  const [language, setLanguage] = useState<'en' | 'ur' | 'roman' | 'both'>('en');
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Rank Math / Yoast SEO Suite Fields
  const [focusKeyword, setFocusKeyword] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [activeSeoPreview, setActiveSeoPreview] = useState<'google' | 'facebook' | 'schema'>('google');
  const [copiedSchema, setCopiedSchema] = useState(false);

  // File Upload & WebP Conversion States & Refs
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingContentImg, setIsUploadingContentImg] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const coverImageFileRef = useRef<HTMLInputElement>(null);
  const contentImageFileRef = useRef<HTMLInputElement>(null);
  const avatarImageFileRef = useRef<HTMLInputElement>(null);
  const contentTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');

  // WordPress-style Link Dialog State (Internal & External Links)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkOpenInNewTab, setLinkOpenInNewTab] = useState(false);
  const [linkNofollow, setLinkNofollow] = useState(false);
  const [linkTypeTab, setLinkTypeTab] = useState<'internal' | 'external'>('internal');
  const [linkSelection, setLinkSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const [hasExistingLink, setHasExistingLink] = useState(false);
  const [internalLinkFilter, setInternalLinkFilter] = useState('');

  // Cover Image File Upload & WebP Auto-Conversion Handler
  const handleCoverImageFile = async (file: File) => {
    if (!file) return;
    try {
      setIsUploadingCover(true);
      const result = await optimizeAndUploadImage(file, 'blog-covers', 1200, 0.85);
      setCoverImage(result.url);

      if (!coverImageAlt) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
        setCoverImageAlt(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }

      addNotification('Cover Converted & Uploaded', 'Blog cover image converted to WebP format (.webp) & optimized.', 'success');
    } catch (err) {
      console.error('Cover image upload/conversion error:', err);
      addNotification('Upload Failed', 'Could not convert image to WebP.', 'warning');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleCoverImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleCoverImageFile(file);
    }
    if (e.target) e.target.value = '';
  };

  // Convert current image URL to WebP Data URL
  const handleConvertUrlToWebP = async () => {
    if (!coverImage) return;
    try {
      setIsUploadingCover(true);
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = coverImage;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const webpDataUrl = canvas.toDataURL('image/webp', 0.85);
        setCoverImage(webpDataUrl);
        addNotification('Converted to WebP', 'Cover image loaded and converted to WebP format!', 'success');
      }
    } catch (err) {
      addNotification('CORS Notice', 'External image URL cannot be directly converted due to CORS restriction. Uploading a local file is recommended.', 'info');
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Content Image File Upload & WebP Auto-Conversion Handler
  const handleContentImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingContentImg(true);
      const result = await optimizeAndUploadImage(file, 'blog-content', 1000, 0.80);
      const altText = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
      const markdownImg = `\n![${altText}](${result.url})\n`;
      setContent(prev => prev + markdownImg);
      addNotification('Content Image Inserted', 'Image converted to WebP & inserted into post content.', 'success');
    } catch (err) {
      console.error('Content image upload error:', err);
      addNotification('Upload Failed', 'Could not convert content image.', 'warning');
    } finally {
      setIsUploadingContentImg(false);
      if (e.target) e.target.value = '';
    }
  };

  // Author Avatar File Upload & WebP Auto-Conversion Handler
  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      const result = await optimizeAndUploadImage(file, 'avatars', 400, 0.85);
      setAuthorAvatar(result.url);
      addNotification('Avatar Updated', 'Author avatar converted to WebP & updated.', 'success');
    } catch (err) {
      addNotification('Avatar Error', 'Failed to update author avatar.', 'warning');
    } finally {
      setIsUploadingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  // Available categories list
  const existingCategories = useMemo(() => {
    const defaultCats = ['Business Guides', 'Sourcing Guides', 'E-Commerce Tips', 'Textile & Fashion', 'Sialkot Sports', 'Market Trends'];
    const dbCats = blogs?.map(b => b.category).filter(Boolean) || [];
    return Array.from(new Set([...defaultCats, ...dbCats]));
  }, [blogs]);

  // Open Editor for Creating or Editing
  const handleOpenEditor = (blogToEdit?: BlogPost) => {
    if (blogToEdit) {
      setEditingBlogId(blogToEdit.id);
      setInitialBlogSnapshot(blogToEdit);
      setTitle(blogToEdit.title || '');
      setSlug(blogToEdit.slug || '');
      setExcerpt(blogToEdit.excerpt || '');
      setContent(blogToEdit.content || '');
      setCategory(blogToEdit.category || 'Business Guides');
      setTagsList(blogToEdit.tags || []);
      setAuthor(blogToEdit.author || 'Pak-Tajarat Editorial');
      setAuthorTitle(blogToEdit.authorTitle || 'Senior Market Analyst');
      setAuthorAvatar(blogToEdit.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
      setCoverImage(blogToEdit.coverImage || '');
      setCoverImageAlt(blogToEdit.coverImageAlt || '');
      setCoverImageCaption(blogToEdit.coverImageCaption || '');
      setStatus(blogToEdit.status || (blogToEdit.isPublished ? 'Published' : 'Draft'));
      setScheduledDate(blogToEdit.scheduledDate || '');
      setLanguage(blogToEdit.language || 'en');
      setIsFeatured(!!blogToEdit.isFeatured);
      setFocusKeyword(blogToEdit.focusKeyword || '');
      setMetaTitle(blogToEdit.metaTitle || blogToEdit.title || '');
      setMetaDescription(blogToEdit.metaDescription || blogToEdit.excerpt || '');
      setMetaKeywords(blogToEdit.metaKeywords || '');
      setCanonicalUrl(blogToEdit.canonicalUrl || '');
    } else {
      setEditingBlogId(null);
      setInitialBlogSnapshot(null);

      // Check if there is an autosaved active draft
      const savedDraft = localStorage.getItem('pak_tajarat_blog_editor_draft');
      let restored = false;
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          if (draft && (draft.title || draft.content)) {
            setTitle(draft.title || '');
            setSlug(draft.slug || '');
            setExcerpt(draft.excerpt || '');
            setContent(draft.content || '');
            setCategory(draft.category || 'Business Guides');
            setTagsList(draft.tagsList || ['Pakistan Business', 'E-Commerce']);
            setAuthor(draft.author || 'Pak-Tajarat Editorial');
            setAuthorTitle(draft.authorTitle || 'Senior Market Analyst');
            setCoverImage(draft.coverImage || 'https://images.unsplash.com/photo-1542744094-3a31b272c490?auto=format&fit=crop&w=800&q=80');
            setCoverImageAlt(draft.coverImageAlt || '');
            setCoverImageCaption(draft.coverImageCaption || '');
            setStatus('Published');
            setScheduledDate(draft.scheduledDate || '');
            setLanguage(draft.language || 'en');
            setIsFeatured(false);
            setFocusKeyword(draft.focusKeyword || '');
            setMetaTitle(draft.metaTitle || '');
            setMetaDescription(draft.metaDescription || '');
            setMetaKeywords(draft.metaKeywords || '');
            setCanonicalUrl(draft.canonicalUrl || '');
            restored = true;
          }
        } catch (_) {}
      }

      if (!restored) {
        setTitle('');
        setSlug('');
        setExcerpt('');
        setContent('');
        setCategory('Business Guides');
        setTagsList(['Pakistan Business', 'E-Commerce']);
        setAuthor('Pak-Tajarat Editorial');
        setAuthorTitle('Senior Market Analyst');
        setAuthorAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
        setCoverImage('https://images.unsplash.com/photo-1542744094-3a31b272c490?auto=format&fit=crop&w=800&q=80');
        setCoverImageAlt('Pakistani Business Market Analysis');
        setCoverImageCaption('Sourcing and wholesale trade across Pakistan');
        setStatus('Published');
        setScheduledDate('');
        setLanguage('en');
        setIsFeatured(false);
        setFocusKeyword('');
        setMetaTitle('');
        setMetaDescription('');
        setMetaKeywords('');
        setCanonicalUrl('');
      }
    }
    setIsEditorOpen(true);
  };

  // Discard all unsaved changes and restore original values
  const handleDiscardChanges = () => {
    if (initialBlogSnapshot) {
      setTitle(initialBlogSnapshot.title || '');
      setSlug(initialBlogSnapshot.slug || '');
      setExcerpt(initialBlogSnapshot.excerpt || '');
      setContent(initialBlogSnapshot.content || '');
      setCategory(initialBlogSnapshot.category || 'Business Guides');
      setTagsList(initialBlogSnapshot.tags || []);
      setAuthor(initialBlogSnapshot.author || 'Pak-Tajarat Editorial');
      setAuthorTitle(initialBlogSnapshot.authorTitle || '');
      setAuthorAvatar(initialBlogSnapshot.authorAvatar || '');
      setCoverImage(initialBlogSnapshot.coverImage || '');
      setCoverImageAlt(initialBlogSnapshot.coverImageAlt || '');
      setCoverImageCaption(initialBlogSnapshot.coverImageCaption || '');
      setStatus(initialBlogSnapshot.status || 'Draft');
      setScheduledDate(initialBlogSnapshot.scheduledDate || '');
      setLanguage(initialBlogSnapshot.language || 'en');
      setIsFeatured(!!initialBlogSnapshot.isFeatured);
      setFocusKeyword(initialBlogSnapshot.focusKeyword || '');
      setMetaTitle(initialBlogSnapshot.metaTitle || '');
      setMetaDescription(initialBlogSnapshot.metaDescription || '');
      setMetaKeywords(initialBlogSnapshot.metaKeywords || '');
      setCanonicalUrl(initialBlogSnapshot.canonicalUrl || '');
    }
    setIsEditorOpen(false);
    addNotification('Changes Discarded', 'Blog edits were discarded without saving.', 'info');
  };

  // Autosave active new blog draft to localStorage
  useEffect(() => {
    if (isEditorOpen && !editingBlogId && (title.trim() || content.trim())) {
      const draftObj = {
        title, slug, excerpt, content, category, tagsList, author, authorTitle,
        coverImage, coverImageAlt, coverImageCaption, focusKeyword, metaTitle,
        metaDescription, metaKeywords, canonicalUrl, status, language
      };
      try {
        localStorage.setItem('pak_tajarat_blog_editor_draft', JSON.stringify(draftObj));
      } catch (_) {}
    }
  }, [isEditorOpen, editingBlogId, title, slug, excerpt, content, category, tagsList, author, authorTitle, coverImage, coverImageAlt, coverImageCaption, focusKeyword, metaTitle, metaDescription, metaKeywords, canonicalUrl, status, language]);

  // Title change triggers automatic slug generation if not manually customized
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditingSlug && !editingBlogId) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setSlug(generatedSlug);
    }
    if (!metaTitle || metaTitle === title) {
      setMetaTitle(val);
    }
  };

  // Add Tag pill
  const handleAddTag = () => {
    if (!tagsInput.trim()) return;
    const cleanTag = tagsInput.trim().replace(/^#/, '');
    if (!tagsList.includes(cleanTag)) {
      setTagsList([...tagsList, cleanTag]);
    }
    setTagsInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList(tagsList.filter(t => t !== tagToRemove));
  };

  // Word count & Estimated reading time calculation
  const wordCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  }, [content]);

  const estimatedReadingTime = useMemo(() => {
    const mins = Math.max(1, Math.ceil(wordCount / 200));
    return `${mins} min read`;
  }, [wordCount]);

  // Rank Math / Yoast SEO Health Score & Audit checklist calculation
  const seoAudit = useMemo(() => {
    const checks = [
      {
        id: 'title_keyword',
        label: 'Focus keyword appears in Post Title',
        passed: focusKeyword ? title.toLowerCase().includes(focusKeyword.toLowerCase()) : false,
      },
      {
        id: 'slug_keyword',
        label: 'Focus keyword appears in Permalink Slug',
        passed: focusKeyword ? slug.toLowerCase().includes(focusKeyword.toLowerCase().replace(/\s+/g, '-')) : false,
      },
      {
        id: 'meta_desc_keyword',
        label: 'Focus keyword appears in Meta Description',
        passed: focusKeyword ? metaDescription.toLowerCase().includes(focusKeyword.toLowerCase()) : false,
      },
      {
        id: 'meta_title_len',
        label: 'Meta Title length is optimal (40 - 65 chars)',
        passed: metaTitle.length >= 40 && metaTitle.length <= 65,
      },
      {
        id: 'meta_desc_len',
        label: 'Meta Description length is optimal (120 - 160 chars)',
        passed: metaDescription.length >= 120 && metaDescription.length <= 160,
      },
      {
        id: 'content_len',
        label: 'Article content length is detailed (300+ words)',
        passed: wordCount >= 300,
      },
      {
        id: 'headings_check',
        label: 'Content uses H2/H3 headings for readable structure',
        passed: /(^|\n)(#{1,4}\s*|<h[1-4])/i.test(content) || content.includes('## ') || content.includes('### '),
      },
      {
        id: 'cover_alt',
        label: 'Featured image has informative Alt Text',
        passed: coverImageAlt.trim().length > 3,
      }
    ];

    const passedCount = checks.filter(c => c.passed).length;
    const score = Math.round((passedCount / checks.length) * 100);

    return { checks, score, passedCount };
  }, [focusKeyword, title, slug, metaDescription, metaTitle, wordCount, content, coverImageAlt]);

  // AI SEO Auto-Generator Helper
  const handleGenerateAiSeo = () => {
    if (!title && !content) {
      addNotification('AI SEO Error', 'Please enter a Post Title or Content first.', 'warning');
      return;
    }

    const cleanTitle = title.trim();
    const cleanExcerpt = excerpt.trim() || content.slice(0, 150).replace(/[#*`>]/g, '').trim();

    // Pick top focus keyword candidate
    let autoKeyword = focusKeyword || 'wholesale trade pakistan';
    if (cleanTitle.toLowerCase().includes('faisalabad')) autoKeyword = 'faisalabad textile wholesale';
    else if (cleanTitle.toLowerCase().includes('sialkot')) autoKeyword = 'sialkot sports goods sourcing';
    else if (cleanTitle.toLowerCase().includes('lahore')) autoKeyword = 'lahore wholesale markets guide';

    const generatedSlug = cleanTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    const generatedMetaTitle = `${cleanTitle} | Pak-Tajarat Trade Hub`;
    const generatedMetaDesc = cleanExcerpt.length > 150 
      ? cleanExcerpt.slice(0, 150) + '...' 
      : `${cleanExcerpt} Read comprehensive market insights on Pak-Tajarat.`;
    const generatedKeywords = `${autoKeyword}, e-commerce pakistan, wholesale sourcing, pak-tajarat guides, ${category.toLowerCase()}`;

    setFocusKeyword(autoKeyword);
    setSlug(generatedSlug);
    setMetaTitle(generatedMetaTitle.slice(0, 60));
    setMetaDescription(generatedMetaDesc.slice(0, 155));
    setMetaKeywords(generatedKeywords);
    setCanonicalUrl(`https://paktajarat.pk/blog/${generatedSlug}`);
    if (!excerpt) setExcerpt(cleanExcerpt);

    addNotification('AI SEO Automation', 'SEO Metatags, Focus Keyword, Slug & Schema generated successfully!', 'success');
  };

  // Schema.org Article / BlogPosting JSON-LD representation
  const schemaJsonLd = useMemo(() => {
    const postSlug = slug || 'post-url';
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalUrl || `https://paktajarat.pk/blog/${postSlug}`
      },
      "headline": metaTitle || title || "Blog Post Title",
      "description": metaDescription || excerpt || "Article summary...",
      "image": [coverImage || "https://paktajarat.pk/logo.png"],
      "datePublished": scheduledDate || new Date().toISOString().split('T')[0],
      "dateModified": new Date().toISOString().split('T')[0],
      "author": {
        "@type": "Person",
        "name": author || "Pak-Tajarat Editorial",
        "jobTitle": authorTitle
      },
      "publisher": {
        "@type": "Organization",
        "name": "Pak-Tajarat Marketplace",
        "logo": {
          "@type": "ImageObject",
          "url": "https://paktajarat.pk/logo.png"
        }
      },
      "keywords": metaKeywords || focusKeyword || "e-commerce, pakistan trade"
    }, null, 2);
  }, [slug, canonicalUrl, metaTitle, title, metaDescription, excerpt, coverImage, scheduledDate, author, authorTitle, metaKeywords, focusKeyword]);

  // Insert Rich Text helper snippet into content
  const insertRichSnippet = (snippet: string) => {
    setContent(prev => prev + (prev.endsWith('\n') ? '' : '\n\n') + snippet);
  };

  // Convert selected text or current line to Headings (H1, H2, H3, H4), Paragraph, or Inline formatting
  const applyTextFormat = (formatType: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'bold' | 'italic' | 'underline' | 'quote' | 'bullet' | 'number' | 'link' | 'code') => {
    const textarea = contentTextAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const fullText = content;

    // Block-level formatting (Headings, Paragraph, Blockquote, Lists)
    if (['h1', 'h2', 'h3', 'h4', 'p', 'quote', 'bullet', 'number'].includes(formatType)) {
      const lineStart = fullText.lastIndexOf('\n', start - 1) + 1;
      let lineEnd = fullText.indexOf('\n', end);
      if (lineEnd === -1) lineEnd = fullText.length;

      const blockText = fullText.substring(lineStart, lineEnd);
      let formattedBlock = '';

      if (['h1', 'h2', 'h3', 'h4', 'p'].includes(formatType)) {
        // Strip any existing heading markers (#, ##, ###, ####, #####) and extra spaces
        const cleanLine = blockText.replace(/^(\#{1,6}\s*)/, '');
        const prefix = 
          formatType === 'h1' ? '# ' :
          formatType === 'h2' ? '## ' :
          formatType === 'h3' ? '### ' :
          formatType === 'h4' ? '#### ' : '';
        
        formattedBlock = prefix + (cleanLine.trim() || (formatType === 'p' ? 'Paragraph text' : 'Section Heading'));
      } else if (formatType === 'quote') {
        const clean = blockText.replace(/^(\>\s*)/, '');
        formattedBlock = `> ${clean || 'Quote text'}`;
      } else if (formatType === 'bullet') {
        formattedBlock = blockText.split('\n').map(line => {
          return line.startsWith('- ') ? line : `- ${line.replace(/^([-*]|\d+\.)\s*/, '')}`;
        }).join('\n');
      } else if (formatType === 'number') {
        formattedBlock = blockText.split('\n').map((line, idx) => {
          return `${idx + 1}. ${line.replace(/^([-*]|\d+\.)\s*/, '')}`;
        }).join('\n');
      }

      const newFullText = fullText.substring(0, lineStart) + formattedBlock + fullText.substring(lineEnd);
      setContent(newFullText);

      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(lineStart, lineStart + formattedBlock.length);
        }
      }, 20);
    } else {
      // Inline formatting (bold, italic, underline, link, code)
      if (start !== end) {
        const selected = fullText.substring(start, end);
        let formatted = '';
        if (formatType === 'bold') formatted = `**${selected}**`;
        else if (formatType === 'italic') formatted = `*${selected}*`;
        else if (formatType === 'underline') formatted = `<u>${selected}</u>`;
        else if (formatType === 'code') formatted = `\`${selected}\``;
        else if (formatType === 'link') formatted = `[${selected}](https://)`;

        const newFullText = fullText.substring(0, start) + formatted + fullText.substring(end);
        setContent(newFullText);

        setTimeout(() => {
          if (textarea) {
            textarea.focus();
            textarea.setSelectionRange(start, start + formatted.length);
          }
        }, 20);
      } else {
        let placeholder = '';
        if (formatType === 'bold') placeholder = '**Bold Text**';
        else if (formatType === 'italic') placeholder = '*Italic Text*';
        else if (formatType === 'underline') placeholder = '<u>Underlined Text</u>';
        else if (formatType === 'code') placeholder = '`Code`';
        else if (formatType === 'link') {
          handleOpenLinkModal();
          return;
        }

        const newFullText = fullText.substring(0, start) + placeholder + fullText.substring(end);
        setContent(newFullText);

        setTimeout(() => {
          if (textarea) {
            textarea.focus();
            textarea.setSelectionRange(start, start + placeholder.length);
          }
        }, 20);
      }
    }
  };

  // Open WordPress Link Modal for selected text
  const handleOpenLinkModal = () => {
    const textarea = contentTextAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const fullText = content;
    const selected = fullText.substring(start, end).trim();

    // Check if selection is already a markdown link [Text](URL)
    const linkMatch = selected.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      setLinkText(linkMatch[1]);
      setLinkUrl(linkMatch[2]);
      setLinkOpenInNewTab(linkMatch[2].startsWith('http') && !linkMatch[2].includes('paktajarat.pk'));
      setHasExistingLink(true);
      setLinkTypeTab(linkMatch[2].startsWith('http') && !linkMatch[2].includes('paktajarat.pk') ? 'external' : 'internal');
    } else {
      setLinkText(selected || '');
      setLinkUrl('');
      setLinkOpenInNewTab(false);
      setHasExistingLink(false);
      setLinkTypeTab('internal');
    }
    setLinkNofollow(false);
    setLinkSelection({ start, end });
    setInternalLinkFilter('');
    setIsLinkModalOpen(true);
  };

  const handleApplyLink = (urlOverride?: string, textOverride?: string) => {
    const finalUrl = (urlOverride || linkUrl).trim();
    const finalText = (textOverride || linkText).trim() || 'Link';

    if (!finalUrl) {
      addNotification('URL Required', 'Please enter or select a valid URL.', 'warning');
      return;
    }

    const textarea = contentTextAreaRef.current;
    const { start, end } = linkSelection;
    const fullText = content;

    const markdownLink = `[${finalText}](${finalUrl})`;
    const newFullText = fullText.substring(0, start) + markdownLink + fullText.substring(end);
    setContent(newFullText);
    setIsLinkModalOpen(false);

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(start, start + markdownLink.length);
      }
    }, 20);

    addNotification('Link Added 🔗', `Linked "${finalText}" to ${finalUrl}`, 'success');
  };

  const handleRemoveLink = () => {
    const { start, end } = linkSelection;
    const fullText = content;
    const selected = fullText.substring(start, end);
    const match = selected.match(/^\[(.*?)\]\((.*?)\)$/);
    if (match) {
      const rawText = match[1];
      const newFullText = fullText.substring(0, start) + rawText + fullText.substring(end);
      setContent(newFullText);
      setIsLinkModalOpen(false);
      addNotification('Link Removed', 'Link formatting removed.', 'success');
    } else {
      setIsLinkModalOpen(false);
    }
  };

  // Save / Publish Post Form Submission
  const handleSavePost = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      addNotification('Title Required', 'Please provide a title for your blog post.', 'warning');
      return;
    }
    if (!content.trim()) {
      addNotification('Content Required', 'Please enter post content before publishing.', 'warning');
      return;
    }

    const finalCategory = isAddingNewCategory && customCategoryInput.trim() 
      ? customCategoryInput.trim() 
      : category;

    const finalSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    const finalPost: BlogPost = {
      id: editingBlogId || `b-${Date.now()}`,
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim() || content.slice(0, 160).replace(/[#*`>]/g, '').trim(),
      content: content.trim(),
      category: finalCategory,
      tags: tagsList.length > 0 ? tagsList : ['Business Guides', 'Pak-Tajarat'],
      author: author.trim() || 'Pak-Tajarat Editorial',
      authorTitle: authorTitle.trim(),
      authorAvatar: authorAvatar.trim(),
      coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1542744094-3a31b272c490?auto=format&fit=crop&w=800&q=80',
      coverImageAlt: coverImageAlt.trim() || title,
      coverImageCaption: coverImageCaption.trim(),
      date: scheduledDate || new Date().toISOString().split('T')[0],
      readTime: estimatedReadingTime,
      status,
      scheduledDate,
      isFeatured,
      isPublished: status === 'Published',
      language,
      metaTitle: metaTitle.trim() || title.trim(),
      metaDescription: metaDescription.trim() || excerpt.trim() || title.trim(),
      metaKeywords: metaKeywords.trim() || focusKeyword,
      focusKeyword: focusKeyword.trim(),
      canonicalUrl: canonicalUrl.trim() || `https://paktajarat.pk/blog/${finalSlug}`,
    };

    if (editingBlogId) {
      await updateBlog(finalPost);
      addNotification('Post Updated', `"${finalPost.title}" was updated successfully in WordPress Blog Suite.`, 'success');
    } else {
      await addBlog(finalPost);
      addNotification('Post Created', `"${finalPost.title}" was created and saved live.`, 'success');
    }

    try {
      localStorage.removeItem('pak_tajarat_blog_editor_draft');
    } catch (_) {}

    setIsEditorOpen(false);
  };

  // Filtered Blog List for Table
  const filteredBlogs = useMemo(() => {
    return (blogs || []).filter(b => {
      const matchesSearch = 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.slug && b.slug.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;
      const matchesLang = selectedLang === 'All' || b.language === selectedLang;
      const matchesStatus = 
        selectedStatus === 'All' ? true :
        selectedStatus === 'Published' ? b.isPublished || b.status === 'Published' :
        selectedStatus === 'Draft' ? b.status === 'Draft' :
        selectedStatus === 'Scheduled' ? b.status === 'Scheduled' :
        selectedStatus === 'Featured' ? b.isFeatured : true;

      return matchesSearch && matchesCat && matchesLang && matchesStatus;
    });
  }, [blogs, searchQuery, selectedCategory, selectedLang, selectedStatus]);

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      
      {/* Top Banner & Control Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-950/50 text-emerald-400 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-800/30">
            <Globe size={12} />
            <span>WordPress Blog Management Engine</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Dynamic Blog Suite & SEO Automation</span>
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl">
            Create, schedule, edit, and optimize SEO rankings for your knowledge articles with Rank Math / Yoast-style focus keyword auditing and Google SERP live previews.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={async () => {
              if (window.confirm("Do you want to clear old demo blogs and activate only the Premium Flexible Hard Shell Backpack product blog?")) {
                const oldIds = ['b-seed-1', 'b-seed-2', 'b-seed-3', 'b-pak-elite-s4-guide'];
                for (const id of oldIds) {
                  try {
                    await deleteBlog(id);
                  } catch (e) {
                    // Ignore
                  }
                }
                addNotification('Demo Blogs Cleared', 'Legacy blogs removed. Premium Hard Shell Backpack blog is active.', 'success');
              }
            }}
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl transition-all cursor-pointer border border-zinc-700"
            title="Remove legacy demo blogs"
          >
            <RefreshCw size={14} />
            <span>Clear Demo Blogs</span>
          </button>
          <button
            onClick={() => handleOpenEditor()}
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 bg-[#0F9D58] hover:bg-[#0b8043] text-white text-xs font-black rounded-xl transition-all shadow-md cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Add New WordPress Post</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Articles</p>
          <h3 className="text-xl font-black font-mono text-white mt-1">{blogs?.length || 0}</h3>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Published Live</p>
          <h3 className="text-xl font-black font-mono text-emerald-400 mt-1">
            {blogs?.filter(b => b.isPublished || b.status === 'Published').length || 0}
          </h3>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Drafts & Scheduled</p>
          <h3 className="text-xl font-black font-mono text-amber-400 mt-1">
            {blogs?.filter(b => b.status === 'Draft' || b.status === 'Scheduled').length || 0}
          </h3>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Featured Posts</p>
          <h3 className="text-xl font-black font-mono text-purple-400 mt-1">
            {blogs?.filter(b => b.isFeatured).length || 0}
          </h3>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 col-span-2 sm:col-span-1">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Categories</p>
          <h3 className="text-xl font-black font-mono text-blue-400 mt-1">{existingCategories.length}</h3>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-4 relative">
          <input
            type="text"
            placeholder="Search post title, slug, content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#0F9D58]"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        </div>

        <div className="md:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0F9D58]"
          >
            <option value="All">All Categories ({existingCategories.length})</option>
            {existingCategories.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0F9D58]"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published Live</option>
            <option value="Draft">Drafts</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Featured">Featured Only</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0F9D58]"
          >
            <option value="All">All Languages</option>
            <option value="en">English</option>
            <option value="ur">اردو (Urdu)</option>
            <option value="roman">Roman English</option>
            <option value="both">Dual / Both</option>
          </select>
        </div>
      </div>

      {/* WordPress Posts Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 text-zinc-400 font-bold uppercase text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4">Category & Tags</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Status & Date</th>
                <th className="py-3 px-4">SEO Health</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <FileText size={32} className="mx-auto mb-2 text-zinc-600" />
                    <p className="font-bold">No blog posts match your criteria.</p>
                    <p className="text-[11px] mt-1">Click "Add New WordPress Post" to publish an article.</p>
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((b) => {
                  const isPub = b.isPublished || b.status === 'Published';
                  return (
                    <tr key={b.id} className="hover:bg-zinc-800/40 transition-colors">
                      
                      {/* Post Thumbnail & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={b.coverImage || 'https://images.unsplash.com/photo-1542744094-3a31b272c490?auto=format&fit=crop&w=120&q=80'}
                            alt={b.title}
                            className="w-12 h-12 rounded-xl object-cover border border-zinc-800 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 max-w-xs">
                            <div className="flex items-center space-x-1.5">
                              {b.isFeatured && (
                                <span className="p-0.5 bg-amber-500/20 text-amber-400 rounded-sm" title="Featured Article">
                                  <Star size={10} fill="currentColor" />
                                </span>
                              )}
                              <h4 className="font-bold text-white text-xs truncate" title={b.title}>
                                {b.title}
                              </h4>
                            </div>
                            <p className="text-[10px] font-mono text-zinc-500 truncate mt-0.5">
                              /blog/{b.slug || 'post'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category & Tags */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-md text-[10px] font-bold">
                          {b.category}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(b.tags || []).slice(0, 2).map((t, idx) => (
                            <span key={idx} className="text-[9px] text-zinc-400 font-mono">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Author */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <img
                            src={b.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                            alt={b.author}
                            className="w-6 h-6 rounded-full object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-xs font-medium text-zinc-300 truncate">{b.author}</span>
                        </div>
                      </td>

                      {/* Status & Date */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {isPub ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 rounded-full text-[9px] font-bold uppercase">
                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                              <span>Published</span>
                            </span>
                          ) : b.status === 'Scheduled' ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-purple-950/80 text-purple-300 border border-purple-800/50 rounded-full text-[9px] font-bold uppercase">
                              <Clock size={9} />
                              <span>Scheduled</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full text-[9px] font-bold uppercase">
                              <span>Draft</span>
                            </span>
                          )}
                          <p className="text-[10px] text-zinc-500 font-mono mt-1">{b.date}</p>
                        </div>
                      </td>

                      {/* SEO Score Badge */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center space-x-1.5 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded-lg">
                          <Sparkles size={11} className="text-emerald-400" />
                          <span className="text-[10px] font-mono font-bold text-white">
                            {b.metaTitle && b.metaDescription ? 'SEO Ready' : 'Basic SEO'}
                          </span>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenEditor(b)}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors cursor-pointer"
                            title="Edit Post in WordPress Suite"
                          >
                            <Edit3 size={13} />
                          </button>
                          
                          <button
                            onClick={async () => {
                              await updateBlog({ ...b, isFeatured: !b.isFeatured });
                              addNotification('Featured Toggled', `"${b.title}" status updated.`, 'info');
                            }}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              b.isFeatured ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                            title="Toggle Featured Status"
                          >
                            <Star size={13} fill={b.isFeatured ? 'currentColor' : 'none'} />
                          </button>

                          <button
                            onClick={() => {
                              localStorage.setItem('pak_tajarat_selected_blog_slug', b.slug);
                              window.open(`/blog/${b.slug}`, '_blank');
                            }}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-blue-400 rounded-lg transition-colors cursor-pointer"
                            title="Preview Article on Site"
                          >
                            <ExternalLink size={13} />
                          </button>

                          <button
                            onClick={async () => {
                              if (window.confirm(`Delete article "${b.title}" permanently?`)) {
                                await deleteBlog(b.id);
                                addNotification('Article Deleted', 'Blog post removed.', 'warning');
                              }
                            }}
                            className="p-1.5 bg-zinc-800 hover:bg-red-950 text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete Article"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* WORDPRESS POST EDITOR & SEO AUTOMATION SUITE MODAL */}
      {/* ========================================================= */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-6xl max-h-[92vh] rounded-3xl overflow-hidden flex flex-col text-left shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#0F9D58]/10 text-[#0F9D58] rounded-xl border border-[#0F9D58]/20">
                  <Globe size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center space-x-2">
                    <span>{editingBlogId ? 'Edit WordPress Article' : 'Publish New WordPress Article'}</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    WordPress Post Editor + Rank Math / Yoast Style SEO Suite
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleGenerateAiSeo}
                  className="px-3 py-1.5 bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-800/60 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer hidden md:flex"
                  title="Auto-generate SEO Metatags, Focus Keyword, Slug & Schema"
                >
                  <Sparkles size={13} />
                  <span>AI SEO Automation</span>
                </button>

                {/* Discard changes top button */}
                <button
                  type="button"
                  onClick={handleDiscardChanges}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-red-950 text-zinc-300 hover:text-red-300 border border-zinc-700 hover:border-red-800/60 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                  title="Discard changes and exit editor"
                >
                  <RotateCcw size={13} />
                  <span>Discard</span>
                </button>

                {/* Save post top button */}
                <button
                  type="button"
                  onClick={() => handleSavePost()}
                  className="px-4 py-1.5 bg-[#0F9D58] hover:bg-[#0b8043] text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                  title="Save post changes and update live"
                >
                  <Save size={13} />
                  <span>Save</span>
                </button>

                <button
                  type="button"
                  onClick={handleDiscardChanges}
                  className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl transition-colors cursor-pointer ml-1"
                  title="Close Editor"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSavePost} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT MAIN COLUMN: Title, Content, Formatting, Summary */}
                <div className="lg:col-span-8 space-y-5">
                  
                  {/* Post Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Post Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Faisalabad Wholesale Textile Market Sourcing Guide 2026..."
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 text-sm sm:text-base font-bold text-white placeholder-zinc-500 focus:outline-none focus:border-[#0F9D58]"
                      required
                    />
                  </div>

                  {/* Permalink Slug Bar */}
                  <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="font-mono text-zinc-500 shrink-0 text-[11px]">https://paktajarat.pk/blog/</span>
                      {isEditingSlug ? (
                        <input
                          type="text"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-0.5 text-xs text-emerald-400 font-mono w-full focus:outline-none"
                        />
                      ) : (
                        <span className="font-mono font-bold text-emerald-400 truncate text-[11px]">
                          {slug || 'post-slug'}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingSlug(!isEditingSlug)}
                      className="ml-2 text-[10px] font-bold text-zinc-400 hover:text-white px-2 py-0.5 bg-zinc-800 rounded-md transition-colors shrink-0 cursor-pointer"
                    >
                      {isEditingSlug ? 'Done' : 'Edit Slug'}
                    </button>
                  </div>

                  {/* Rich Text Toolbar (WordPress-style Heading & Text Selection Formatter) */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-2.5 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
                      {/* Heading & Block Selector Dropdown */}
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase flex items-center space-x-1">
                          <Heading size={12} className="text-[#0F9D58]" />
                          <span>Format:</span>
                        </span>

                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              applyTextFormat(e.target.value as any);
                              e.target.value = '';
                            }
                          }}
                          className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-700/80 text-zinc-200 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#0F9D58] cursor-pointer"
                          title="Select text and choose Heading or Paragraph"
                        >
                          <option value="">Choose Heading ▾</option>
                          <option value="p">¶ Paragraph (Normal Text)</option>
                          <option value="h1">H1 Heading 1 (Main Title)</option>
                          <option value="h2">H2 Heading 2 (Main Section)</option>
                          <option value="h3">H3 Heading 3 (Sub Heading)</option>
                          <option value="h4">H4 Heading 4 (Minor Topic)</option>
                        </select>

                        {/* Quick Direct Heading Buttons (Click to format selected text or line) */}
                        <div className="flex items-center space-x-1 pl-1 border-l border-zinc-800">
                          <button
                            type="button"
                            onClick={() => applyTextFormat('h1')}
                            className="px-2 py-1 bg-zinc-900 hover:bg-emerald-950 hover:text-emerald-400 hover:border-emerald-600/50 border border-zinc-800 text-zinc-300 rounded-md font-black text-[11px] transition-all cursor-pointer"
                            title="Convert selected text/line to H1 Heading (#)"
                          >
                            H1
                          </button>
                          <button
                            type="button"
                            onClick={() => applyTextFormat('h2')}
                            className="px-2 py-1 bg-zinc-900 hover:bg-emerald-950 hover:text-emerald-400 hover:border-emerald-600/50 border border-zinc-800 text-zinc-300 rounded-md font-black text-[11px] transition-all cursor-pointer"
                            title="Convert selected text/line to H2 Heading (##)"
                          >
                            H2
                          </button>
                          <button
                            type="button"
                            onClick={() => applyTextFormat('h3')}
                            className="px-2 py-1 bg-zinc-900 hover:bg-emerald-950 hover:text-emerald-400 hover:border-emerald-600/50 border border-zinc-800 text-zinc-300 rounded-md font-black text-[11px] transition-all cursor-pointer"
                            title="Convert selected text/line to H3 Subheading (###)"
                          >
                            H3
                          </button>
                          <button
                            type="button"
                            onClick={() => applyTextFormat('h4')}
                            className="px-2 py-1 bg-zinc-900 hover:bg-emerald-950 hover:text-emerald-400 hover:border-emerald-600/50 border border-zinc-800 text-zinc-300 rounded-md font-black text-[11px] transition-all cursor-pointer"
                            title="Convert selected text/line to H4 Subheading (####)"
                          >
                            H4
                          </button>
                          <button
                            type="button"
                            onClick={() => applyTextFormat('p')}
                            className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-md font-bold text-[11px] transition-all cursor-pointer"
                            title="Revert selected heading back to Normal Paragraph"
                          >
                            P (Normal)
                          </button>
                        </div>
                      </div>

                      {/* Write vs Live Preview Tab Switcher */}
                      <div className="flex items-center space-x-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-xs">
                        <button
                          type="button"
                          onClick={() => setEditorTab('write')}
                          className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center space-x-1 cursor-pointer ${editorTab === 'write' ? 'bg-[#0F9D58] text-white shadow-xs' : 'text-zinc-400 hover:text-white'}`}
                        >
                          <Edit3 size={11} />
                          <span>Editor</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorTab('preview')}
                          className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center space-x-1 cursor-pointer ${editorTab === 'preview' ? 'bg-[#0F9D58] text-white shadow-xs' : 'text-zinc-400 hover:text-white'}`}
                        >
                          <Eye size={11} />
                          <span>Live Preview</span>
                        </button>
                      </div>
                    </div>

                    {/* Inline Formatting Actions */}
                    <div className="flex flex-wrap items-center gap-1 text-xs">
                      <button
                        type="button"
                        onClick={() => applyTextFormat('bold')}
                        className="p-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-md font-black text-xs cursor-pointer flex items-center space-x-1 border border-zinc-800/80"
                        title="Bold (Select text & make Bold **)"
                      >
                        <Bold size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTextFormat('italic')}
                        className="p-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-md text-xs cursor-pointer flex items-center space-x-1 border border-zinc-800/80"
                        title="Italic (Select text & make Italic *)"
                      >
                        <Italic size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTextFormat('underline')}
                        className="p-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-md text-xs cursor-pointer flex items-center space-x-1 border border-zinc-800/80"
                        title="Underline (Select text & underline <u>)"
                      >
                        <Underline size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTextFormat('quote')}
                        className="p-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-md text-xs cursor-pointer flex items-center space-x-1 border border-zinc-800/80"
                        title="Blockquote (Select line & make quote >)"
                      >
                        <Quote size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTextFormat('bullet')}
                        className="p-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-md text-xs cursor-pointer flex items-center space-x-1 border border-zinc-800/80"
                        title="Bullet List (Select lines & make list -)"
                      >
                        <List size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTextFormat('number')}
                        className="p-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-md text-xs cursor-pointer flex items-center space-x-1 border border-zinc-800/80"
                        title="Numbered List (Select lines & make 1. 2. 3.)"
                      >
                        <ListOrdered size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenLinkModal}
                        className="p-1.5 px-2 bg-zinc-900 hover:bg-emerald-950/60 hover:text-emerald-400 hover:border-emerald-600/50 text-zinc-300 rounded-md text-xs cursor-pointer flex items-center space-x-1 border border-zinc-800/80 transition-colors"
                        title="Insert or Edit Link (Select text & click or press Ctrl+K)"
                      >
                        <LinkIcon size={13} />
                        <span className="text-[10px] font-bold">Link</span>
                      </button>

                      <input
                        type="file"
                        ref={contentImageFileRef}
                        onChange={handleContentImageFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => contentImageFileRef.current?.click()}
                        className="ml-auto px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-400 rounded-lg font-bold text-[11px] cursor-pointer flex items-center space-x-1"
                        title="Upload image from computer and auto-convert to WebP format"
                      >
                        {isUploadingContentImg ? <RefreshCw size={11} className="animate-spin" /> : <Upload size={11} />}
                        <span>{isUploadingContentImg ? 'Converting...' : 'Upload & Insert WebP Image'}</span>
                      </button>
                    </div>

                    {/* Helpful tip badge */}
                    <div className="bg-zinc-900/60 px-2.5 py-1.5 rounded-lg border border-zinc-800/60 text-[10px] text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span>💡 <strong>WordPress Setup:</strong> کسی بھی ٹیکسٹ کو سلیکٹ کر کے <strong>H1, H2, H3</strong> سے ہیڈنگ بنائیں، یا <strong>Link (Ctrl+K)</strong> سے پروڈکٹس، پیجز یا بیرونی لنکس جوڑیں!</span>
                      <span className="font-mono text-emerald-400 font-bold shrink-0"># H1 | ## H2 | 🔗 Link (Ctrl+K)</span>
                    </div>
                  </div>

                  {/* Main Article Content Editor or Live Preview */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5">
                        <span>Article Content</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full font-mono">
                          {editorTab === 'write' ? 'Markdown Editor' : 'Live Preview Mode'}
                        </span>
                      </label>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {wordCount} words | est. {estimatedReadingTime}
                      </span>
                    </div>

                    {editorTab === 'write' ? (
                      <textarea
                        ref={contentTextAreaRef}
                        placeholder="Write your article here. Select any line or text and click H1, H2, or H3 above to convert it into a heading, or select text and click Link (Ctrl+K) to add internal/external links..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={(e) => {
                          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                            e.preventDefault();
                            handleOpenLinkModal();
                          }
                        }}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 font-mono leading-relaxed h-80 focus:outline-none focus:border-[#0F9D58]"
                        required
                      />
                    ) : (
                      <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-zinc-100 h-80 overflow-y-auto space-y-3 text-left">
                        {content.trim() ? (
                          content.split('\n').map((line, idx) => {
                            const trimmed = line.trim();

                            const mdHeading = trimmed.match(/^(#{1,4})\s*(.*)$/);
                            const htmlHeading = trimmed.match(/^<h([1-4])[^>]*>(.*?)<\/h\1>$/i);

                            if (mdHeading || htmlHeading) {
                              const level = mdHeading ? mdHeading[1].length : parseInt(htmlHeading![1], 10);
                              const headingText = (mdHeading ? mdHeading[2] : htmlHeading![2]).replace(/<[^>]+>/g, '').trim();

                              if (level === 1) {
                                return (
                                  <h1 key={idx} className="text-xl sm:text-2xl font-black text-white mt-4 mb-2 border-b border-[#0F9D58]/40 pb-2">
                                    {headingText}
                                  </h1>
                                );
                              }
                              if (level === 2) {
                                return (
                                  <h2 key={idx} className="text-lg sm:text-xl font-black text-white mt-4 mb-2 border-b border-zinc-800 pb-1.5">
                                    {headingText}
                                  </h2>
                                );
                              }
                              if (level === 3) {
                                return (
                                  <h3 key={idx} className="text-base font-bold text-emerald-400 mt-3 mb-1">
                                    {headingText}
                                  </h3>
                                );
                              }
                              if (level === 4) {
                                return (
                                  <h4 key={idx} className="text-sm font-semibold text-zinc-200 mt-2 mb-1 text-emerald-300">
                                    {headingText}
                                  </h4>
                                );
                              }
                            }

                            if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
                              const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
                              const isDivider = cells.every(c => /^:?-+:?$/.test(c));
                              if (isDivider) return null;
                              return (
                                <div key={idx} className="grid grid-cols-3 gap-2 bg-zinc-900/80 p-2 rounded-lg text-[11px] font-mono border border-zinc-800 my-1">
                                  {cells.map((c, ci) => <span key={ci} className="truncate text-zinc-200">{c}</span>)}
                                </div>
                              );
                            }

                            if (trimmed.startsWith('> ')) {
                              return (
                                <blockquote key={idx} className="border-l-4 border-[#0F9D58] pl-3 py-1 my-2 italic text-zinc-300 bg-zinc-900/60 rounded-r-lg text-xs">
                                  {trimmed.slice(2)}
                                </blockquote>
                              );
                            }
                            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                              return (
                                <li key={idx} className="list-disc ml-5 text-xs text-zinc-300 my-0.5">
                                  {trimmed.slice(2)}
                                </li>
                              );
                            }
                            const numMatch = trimmed.match(/^(\d+)\.\s(.*)$/);
                            if (numMatch) {
                              return (
                                <li key={idx} className="list-decimal ml-5 text-xs text-zinc-300 my-0.5">
                                  {numMatch[2]}
                                </li>
                              );
                            }
                            if (trimmed.startsWith('![') && trimmed.includes('](')) {
                              const match = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
                              if (match) {
                                return (
                                  <div key={idx} className="my-3">
                                    <img src={match[2]} alt={match[1]} className="max-h-56 rounded-xl border border-zinc-800 object-cover" />
                                    {match[1] && <p className="text-[10px] text-zinc-500 mt-1 italic">{match[1]}</p>}
                                  </div>
                                );
                              }
                            }
                            if (trimmed === '') {
                              return <div key={idx} className="h-2" />;
                            }
                            return (
                              <p key={idx} className="text-xs text-zinc-300 leading-relaxed mb-2">
                                {trimmed}
                              </p>
                            );
                          })
                        ) : (
                          <div className="p-8 text-center text-zinc-500 text-xs italic">
                            No content written yet. Switch to Editor tab and write your text, or select lines to convert to H1, H2, H3 headings.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Post Excerpt / Short Summary */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      Excerpt / Short Summary
                    </label>
                    <textarea
                      placeholder="Provide a compelling 2-sentence summary for search engine snippet previews..."
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-600 h-20 focus:outline-none focus:border-[#0F9D58]"
                    />
                  </div>

                </div>

                {/* RIGHT SIDEBAR: WordPress Publishing, Categories, Featured Image */}
                <div className="lg:col-span-4 space-y-5">
                  
                  {/* Publish Box */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-4">
                    <h4 className="font-extrabold text-xs text-white uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center justify-between">
                      <span>Publishing Settings</span>
                      <Calendar size={13} className="text-emerald-400" />
                    </h4>

                    {/* Status Selection */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-400">Status</label>
                      <select
                        value={status}
                        onChange={(e: any) => setStatus(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#0F9D58]"
                      >
                        <option value="Published">Published Live</option>
                        <option value="Draft">Draft</option>
                        <option value="Scheduled">Scheduled</option>
                      </select>
                    </div>

                    {/* Scheduled Date input */}
                    {status === 'Scheduled' && (
                      <div className="space-y-1 animate-in fade-in">
                        <label className="text-[11px] font-bold text-purple-400">Scheduled Date & Time</label>
                        <input
                          type="datetime-local"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#0F9D58]"
                        />
                      </div>
                    )}

                    {/* Language Selector */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-400">Article Language</label>
                      <select
                        value={language}
                        onChange={(e: any) => setLanguage(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#0F9D58]"
                      >
                        <option value="en">English (Standard)</option>
                        <option value="ur">اردو (Urdu)</option>
                        <option value="roman">Roman English</option>
                        <option value="both">Dual / Both</option>
                      </select>
                    </div>

                    {/* Featured Toggle */}
                    <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border border-zinc-800/60">
                      <div>
                        <p className="text-xs font-bold text-white">Featured Article</p>
                        <p className="text-[10px] text-zinc-400">Display in top hero blog banner</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="w-4 h-4 accent-[#0F9D58] rounded cursor-pointer"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#0F9D58] hover:bg-[#0b8043] text-white text-xs font-black rounded-xl transition-all shadow-md cursor-pointer text-center"
                    >
                      {editingBlogId ? 'Update WordPress Article' : 'Save & Publish Article'}
                    </button>
                  </div>

                  {/* Category & Tags Box */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-4">
                    <h4 className="font-extrabold text-xs text-white uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center justify-between">
                      <span>Category & Tags</span>
                      <Folder size={13} className="text-blue-400" />
                    </h4>

                    {/* Category Selection */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-zinc-400">Category</label>
                        <button
                          type="button"
                          onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                          className="text-[10px] font-bold text-[#0F9D58] hover:underline"
                        >
                          {isAddingNewCategory ? 'Select Existing' : '+ Add New Category'}
                        </button>
                      </div>

                      {isAddingNewCategory ? (
                        <input
                          type="text"
                          placeholder="Type new category name..."
                          value={customCategoryInput}
                          onChange={(e) => setCustomCategoryInput(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#0F9D58]"
                        />
                      ) : (
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#0F9D58]"
                        >
                          {existingCategories.map((c, idx) => (
                            <option key={idx} value={c}>{c}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Tags Input */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-zinc-400">Tags (Press Enter)</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Add tag..."
                          value={tagsInput}
                          onChange={(e) => setTagsInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#0F9D58]"
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="px-3 py-2 bg-zinc-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                        >
                          Add
                        </button>
                      </div>

                      {/* Tags Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {tagsList.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] rounded-lg font-mono"
                          >
                            <span>#{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="text-zinc-500 hover:text-red-400 ml-1"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Featured Image Box with Auto-WebP Upload */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
                    <h4 className="font-extrabold text-xs text-white uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <span>Featured Cover Image</span>
                        <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 text-[9px] font-mono rounded font-bold border border-emerald-800/40">Auto WebP</span>
                      </span>
                      <Image size={13} className="text-purple-400" />
                    </h4>

                    {/* Hidden file input for cover image upload */}
                    <input
                      type="file"
                      ref={coverImageFileRef}
                      onChange={handleCoverImageFileUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    {/* Drag & Drop Upload Zone */}
                    <div
                      onClick={() => coverImageFileRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleCoverImageFile(e.dataTransfer.files[0]);
                        }
                      }}
                      className="border-2 border-dashed border-zinc-700 hover:border-[#0F9D58] bg-zinc-900/60 hover:bg-zinc-900 rounded-2xl p-4 text-center cursor-pointer transition-all space-y-2 group"
                    >
                      {isUploadingCover ? (
                        <div className="py-2 flex flex-col items-center justify-center space-y-1.5">
                          <RefreshCw size={22} className="text-[#0F9D58] animate-spin" />
                          <p className="text-xs font-bold text-white">Converting to WebP & Processing...</p>
                          <p className="text-[10px] text-zinc-400 font-mono">Optimizing image format & resolution</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="w-9 h-9 mx-auto bg-emerald-950/60 text-[#0F9D58] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border border-emerald-800/40">
                            <Upload size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white group-hover:text-[#0F9D58] transition-colors">
                              Click or Drag & Drop Image
                            </p>
                            <p className="text-[10px] text-zinc-400">
                              PNG, JPG, JPEG, GIF (Auto WebP Conversion)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <label className="font-bold text-zinc-400">Or Image URL</label>
                        {coverImage && (
                          <button
                            type="button"
                            onClick={handleConvertUrlToWebP}
                            className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center space-x-1 cursor-pointer"
                            title="Convert current image URL to WebP format"
                          >
                            <Sparkles size={10} />
                            <span>Convert URL to WebP</span>
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#0F9D58]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400">Image Alt Text (SEO)</label>
                        <input
                          type="text"
                          placeholder="Description for SEO"
                          value={coverImageAlt}
                          onChange={(e) => setCoverImageAlt(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-[11px] text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400">Caption</label>
                        <input
                          type="text"
                          placeholder="Image caption"
                          value={coverImageCaption}
                          onChange={(e) => setCoverImageCaption(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-[11px] text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {coverImage && (
                      <div className="mt-2 relative rounded-xl overflow-hidden border border-zinc-800 aspect-video bg-zinc-900 group">
                        <img
                          src={coverImage}
                          alt={coverImageAlt || title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 right-2 bg-emerald-950/90 text-emerald-400 border border-emerald-800/60 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center space-x-1">
                          <CheckCircle2 size={10} />
                          <span>WEBP OPTIMIZED</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCoverImage('')}
                          className="absolute top-2 left-2 p-1 bg-red-950/80 text-red-400 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Remove Cover Image"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Author Meta Box */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
                    <h4 className="font-extrabold text-xs text-white uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center justify-between">
                      <span>Author Info</span>
                      <User size={13} className="text-teal-400" />
                    </h4>

                    <input
                      type="file"
                      ref={avatarImageFileRef}
                      onChange={handleAvatarFileUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="flex items-center space-x-3 pb-2 border-b border-zinc-800/60">
                      <img
                        src={authorAvatar}
                        alt={author}
                        className="w-10 h-10 rounded-full object-cover border border-emerald-500/40 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => avatarImageFileRef.current?.click()}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold rounded-xl transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        {isUploadingAvatar ? <RefreshCw size={11} className="animate-spin" /> : <Upload size={11} />}
                        <span>{isUploadingAvatar ? 'Converting...' : 'Upload Avatar (WebP)'}</span>
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-400">Author Name</label>
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-400">Author Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Market Counselor"
                        value={authorTitle}
                        onChange={(e) => setAuthorTitle(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                </div>

              </div>

              {/* ========================================================= */}
              {/* RANK MATH / YOAST STYLE SEO & SOCIAL AUTOMATION SUITE */}
              {/* ========================================================= */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center space-x-1.5 text-[#0F9D58] font-black text-xs uppercase tracking-wider">
                      <Sparkles size={14} />
                      <span>Rank Math & Yoast Grade SEO Automation</span>
                    </div>
                    <h4 className="text-lg font-extrabold text-white">Search Engine Optimization & Social Sharing Suite</h4>
                  </div>

                  {/* SEO Health Score Ring */}
                  <div className="flex items-center space-x-3 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2 shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">SEO Health Score</p>
                      <p className={`text-lg font-black font-mono ${
                        seoAudit.score >= 80 ? 'text-emerald-400' :
                        seoAudit.score >= 50 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {seoAudit.score} / 100
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs font-mono ${
                      seoAudit.score >= 80 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      seoAudit.score >= 50 ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-red-950 text-red-400 border border-red-800'
                    }`}>
                      {seoAudit.passedCount}/8
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left SEO Inputs & Checklist */}
                  <div className="lg:col-span-7 space-y-4">
                    
                    {/* Focus Keyword */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                        <span>Focus Keyword</span>
                        <span className="text-[10px] text-zinc-400 font-normal">Target keyword for Google indexing</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. faisalabad textile wholesale market"
                        value={focusKeyword}
                        onChange={(e) => setFocusKeyword(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-emerald-400 placeholder-zinc-600 focus:outline-none focus:border-[#0F9D58]"
                      />
                    </div>

                    {/* Meta Title */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-bold text-zinc-300 uppercase tracking-wider">SEO Meta Title</label>
                        <span className={`font-mono text-[11px] ${metaTitle.length >= 40 && metaTitle.length <= 65 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {metaTitle.length} / 60 chars
                        </span>
                      </div>
                      <input
                        type="text"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#0F9D58]"
                      />
                    </div>

                    {/* Meta Description */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-bold text-zinc-300 uppercase tracking-wider">SEO Meta Description</label>
                        <span className={`font-mono text-[11px] ${metaDescription.length >= 120 && metaDescription.length <= 160 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {metaDescription.length} / 155 chars
                        </span>
                      </div>
                      <textarea
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 h-20 focus:outline-none focus:border-[#0F9D58]"
                      />
                    </div>

                    {/* Meta Keywords & Canonical */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-400">Meta Keywords (Comma separated)</label>
                        <input
                          type="text"
                          value={metaKeywords}
                          onChange={(e) => setMetaKeywords(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-400">Canonical Tag URL</label>
                        <input
                          type="text"
                          value={canonicalUrl}
                          onChange={(e) => setCanonicalUrl(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Live SEO Checklist Audit */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
                      <h5 className="font-extrabold text-xs text-zinc-300 uppercase tracking-wider">SEO Analysis Audit Checklist</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {seoAudit.checks.map((item) => (
                          <div key={item.id} className="flex items-start space-x-2 text-[11px]">
                            {item.passed ? (
                              <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle size={13} className="text-amber-400 shrink-0 mt-0.5" />
                            )}
                            <span className={item.passed ? 'text-zinc-300 font-medium' : 'text-zinc-500'}>
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Right SERP Snippet Preview & Schema */}
                  <div className="lg:col-span-5 space-y-4">
                    
                    {/* Preview Mode Selector */}
                    <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
                      <button
                        type="button"
                        onClick={() => setActiveSeoPreview('google')}
                        className={`flex-1 py-1.5 font-extrabold rounded-lg transition-all ${
                          activeSeoPreview === 'google' ? 'bg-[#0F9D58] text-white' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Google SERP
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSeoPreview('facebook')}
                        className={`flex-1 py-1.5 font-extrabold rounded-lg transition-all ${
                          activeSeoPreview === 'facebook' ? 'bg-[#0F9D58] text-white' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Social Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSeoPreview('schema')}
                        className={`flex-1 py-1.5 font-extrabold rounded-lg transition-all ${
                          activeSeoPreview === 'schema' ? 'bg-[#0F9D58] text-white' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        JSON-LD Schema
                      </button>
                    </div>

                    {/* Google SERP Card Preview */}
                    {activeSeoPreview === 'google' && (
                      <div className="bg-white rounded-2xl p-4 space-y-2 border border-gray-200 text-left shadow-md">
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 rounded-full bg-[#0F9D58] text-white font-bold text-[10px] flex items-center justify-center">
                            PT
                          </div>
                          <div>
                            <p className="text-[11px] font-medium text-gray-900 leading-none">Pak-Tajarat</p>
                            <p className="text-[10px] font-mono text-gray-500 truncate leading-none mt-0.5">
                              {canonicalUrl || `https://paktajarat.pk/blog/${slug || 'post-slug'}`}
                            </p>
                          </div>
                        </div>
                        <h5 className="text-sm font-bold text-blue-700 hover:underline leading-snug cursor-pointer">
                          {metaTitle || title || 'Post Title Preview'}
                        </h5>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {metaDescription || excerpt || 'Your post meta description snippet will appear here in Google search engine results.'}
                        </p>
                      </div>
                    )}

                    {/* Social Media Card Preview */}
                    {activeSeoPreview === 'facebook' && (
                      <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 text-left shadow-md">
                        {coverImage && (
                          <img
                            src={coverImage}
                            alt={title}
                            className="w-full h-36 object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="p-3 bg-slate-800/90 space-y-1">
                          <p className="text-[9px] font-mono uppercase text-slate-400">PAKTAJARAT.PK</p>
                          <h5 className="text-xs font-bold text-white line-clamp-1">{metaTitle || title}</h5>
                          <p className="text-[11px] text-slate-300 line-clamp-2 leading-snug">{metaDescription || excerpt}</p>
                        </div>
                      </div>
                    )}

                    {/* JSON-LD Schema Box */}
                    {activeSeoPreview === 'schema' && (
                      <div className="bg-zinc-900 rounded-2xl p-3 border border-zinc-800 text-left space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-emerald-400 font-bold">Schema.org BlogPosting</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(schemaJsonLd);
                              setCopiedSchema(true);
                              setTimeout(() => setCopiedSchema(false), 2000);
                            }}
                            className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] rounded flex items-center space-x-1 cursor-pointer"
                          >
                            {copiedSchema ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                            <span>{copiedSchema ? 'Copied' : 'Copy JSON'}</span>
                          </button>
                        </div>
                        <pre className="text-[10px] font-mono text-zinc-300 bg-zinc-950 p-2.5 rounded-xl overflow-x-auto max-h-48 scrollbar-thin">
                          {schemaJsonLd}
                        </pre>
                      </div>
                    )}

                  </div>

                </div>

              </div>

            </form>

            {/* Sticky Modal Bottom Action Footer Bar */}
            <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center space-x-3 text-xs text-zinc-400">
                <div className="flex items-center space-x-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${status === 'Published' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  <span className="font-bold text-white uppercase text-[10px] tracking-wider">
                    {status || 'Draft'}
                  </span>
                </div>
                <span className="text-zinc-700">|</span>
                <span className="text-zinc-300 font-medium truncate max-w-xs sm:max-w-md">
                  {title ? `"${title}"` : 'Untitled Article'}
                </span>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                {/* Discard Changes button */}
                <button
                  type="button"
                  onClick={handleDiscardChanges}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-red-950/80 text-zinc-300 hover:text-red-300 border border-zinc-700 hover:border-red-800/80 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-xs"
                  title="Discard all changes and restore original state"
                >
                  <RotateCcw size={14} />
                  <span>Discard Changes</span>
                </button>

                {/* Save and Update Live button */}
                <button
                  type="button"
                  onClick={() => handleSavePost()}
                  className="px-6 py-2.5 bg-[#0F9D58] hover:bg-[#0b8043] text-white font-black rounded-xl text-xs shadow-lg shadow-[#0F9D58]/20 transition-all flex items-center space-x-2 cursor-pointer"
                  title="Save post changes and update article live across site"
                >
                  <Save size={14} />
                  <span>Save & Update Live</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* WordPress-style Link Dialog Modal (Internal & External Links) */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150 text-left">
            
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-950 text-[#0F9D58] flex items-center justify-center border border-emerald-800/40">
                  <LinkIcon size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    {hasExistingLink ? 'Edit Link (ورڈپریس لنک ایڈٹ کریں)' : 'Insert Link (ورڈپریس لنک لگائیں)'}
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    Add internal store links (products, pages, blogs) or external web links
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              
              {/* Text to Display (Anchor Text) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Text to Display (Anchor Text)</span>
                  <span className="text-[10px] font-normal text-zinc-500">جو ٹیکسٹ نظر آئے گا</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Faisalabad Textile Market or Buy Now"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#0F9D58]"
                />
              </div>

              {/* URL Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Target URL (لنک کا ایڈریس)</span>
                  <span className="text-[10px] font-normal text-zinc-500">جیسے /products یا https://example.com</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="https://... or /products or /about"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-[#0F9D58]"
                  />
                  <LinkIcon size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                </div>
              </div>

              {/* Link Type Selector Tabs */}
              <div className="pt-1">
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-bold text-center">
                  <button
                    type="button"
                    onClick={() => setLinkTypeTab('internal')}
                    className={`py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${linkTypeTab === 'internal' ? 'bg-[#0F9D58] text-white shadow-xs' : 'text-zinc-400 hover:text-white'}`}
                  >
                    <span>🏬 Internal Store Links (اندرونی)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkTypeTab('external')}
                    className={`py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${linkTypeTab === 'external' ? 'bg-[#0F9D58] text-white shadow-xs' : 'text-zinc-400 hover:text-white'}`}
                  >
                    <span>🌐 External Web Link (بیرونی)</span>
                  </button>
                </div>
              </div>

              {/* INTERNAL LINKS PICKER */}
              {linkTypeTab === 'internal' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  {/* Search filter for internal links */}
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search website pages, products, or blog articles..."
                      value={internalLinkFilter}
                      onChange={(e) => setInternalLinkFilter(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#0F9D58]"
                    />
                  </div>

                  {/* Standard Website Pages Grid */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Key Store Pages (ایک کلک سے لنک کریں):
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                      {[
                        { title: 'Products Catalogue', url: '/products', icon: '🛍️' },
                        { title: 'Home Page', url: '/', icon: '🏠' },
                        { title: 'About Us', url: '/about', icon: '🏢' },
                        { title: 'Contact Support', url: '/contact', icon: '📞' },
                        { title: 'Affiliate Portal', url: '/affiliate-portal', icon: '🤝' },
                        { title: 'Blog Directory', url: '/blog', icon: '📰' },
                        { title: 'FAQ & Help', url: '/faq', icon: '❓' },
                        { title: 'Privacy Policy', url: '/privacy', icon: '🔒' },
                        { title: 'Terms & Conditions', url: '/terms', icon: '📜' },
                        { title: 'Refund Policy', url: '/refund', icon: '🔁' },
                      ]
                        .filter(item => !internalLinkFilter || item.title.toLowerCase().includes(internalLinkFilter.toLowerCase()) || item.url.includes(internalLinkFilter.toLowerCase()))
                        .map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setLinkUrl(item.url);
                              if (!linkText || linkText === 'Click Here') setLinkText(item.title);
                            }}
                            className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center space-x-1.5 truncate ${
                              linkUrl === item.url 
                                ? 'bg-emerald-950/80 border-[#0F9D58] text-white shadow-xs' 
                                : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white'
                            }`}
                          >
                            <span className="shrink-0">{item.icon}</span>
                            <div className="min-w-0 truncate">
                              <p className="font-bold truncate text-[11px] leading-tight">{item.title}</p>
                              <p className="font-mono text-[9px] text-zinc-500 truncate">{item.url}</p>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Store Products Picker */}
                  {products && products.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Store Products (پروڈکٹس سے لنک کریں):</span>
                        <span className="text-[9px] text-emerald-400 font-mono">{products.length} products available</span>
                      </p>
                      <div className="max-h-36 overflow-y-auto space-y-1 border border-zinc-800/80 rounded-xl p-1 bg-zinc-900/40 divide-y divide-zinc-800/50">
                        {products
                          .filter(p => !internalLinkFilter || p.name.toLowerCase().includes(internalLinkFilter.toLowerCase()) || p.category.toLowerCase().includes(internalLinkFilter.toLowerCase()))
                          .slice(0, 10)
                          .map((p, idx) => (
                            <button
                              key={`p-${p.id || idx}`}
                              type="button"
                              onClick={() => {
                                const prodUrl = `/products/${p.id}`;
                                setLinkUrl(prodUrl);
                                if (!linkText || linkText === 'Click Here') setLinkText(p.name);
                              }}
                              className={`w-full p-1.5 rounded-lg text-left transition-colors flex items-center space-x-2 cursor-pointer ${
                                linkUrl === `/products/${p.id}` ? 'bg-emerald-950 text-white' : 'hover:bg-zinc-800/70 text-zinc-300'
                              }`}
                            >
                              <img src={p.image} alt={p.name} className="w-7 h-7 rounded object-cover shrink-0 border border-zinc-800" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                                <p className="text-[10px] text-zinc-500 font-mono">Rs. {p.price.toLocaleString()} • {p.category}</p>
                              </div>
                              <span className="text-[10px] font-mono text-emerald-400 shrink-0">Select</span>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Existing Blogs Picker */}
                  {blogs && blogs.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Other Blog Posts (دوسرے بلاگز سے انٹرنل SEO لنکنگ):</span>
                        <span className="text-[9px] text-emerald-400 font-mono">{blogs.length} articles</span>
                      </p>
                      <div className="max-h-32 overflow-y-auto space-y-1 border border-zinc-800/80 rounded-xl p-1 bg-zinc-900/40 divide-y divide-zinc-800/50">
                        {blogs
                          .filter(b => b.id !== editingBlogId)
                          .filter(b => !internalLinkFilter || b.title.toLowerCase().includes(internalLinkFilter.toLowerCase()) || b.slug.toLowerCase().includes(internalLinkFilter.toLowerCase()))
                          .slice(0, 8)
                          .map((b, idx) => (
                            <button
                              key={`b-${b.id || idx}`}
                              type="button"
                              onClick={() => {
                                const blogUrl = `/blog/${b.slug}`;
                                setLinkUrl(blogUrl);
                                if (!linkText || linkText === 'Click Here') setLinkText(b.title);
                              }}
                              className={`w-full p-1.5 rounded-lg text-left transition-colors flex items-center justify-between cursor-pointer ${
                                linkUrl === `/blog/${b.slug}` ? 'bg-emerald-950 text-white' : 'hover:bg-zinc-800/70 text-zinc-300'
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <p className="text-xs font-medium text-white truncate">{b.title}</p>
                                <p className="text-[9px] text-zinc-500 font-mono truncate">/blog/{b.slug}</p>
                              </div>
                              <span className="text-[10px] font-mono text-emerald-400 shrink-0">Link</span>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* EXTERNAL LINKS TAB */}
              {linkTypeTab === 'external' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <p className="text-[10px] text-zinc-400">
                    بیرونی ویب سائٹ کا مکمل لنک درج کریں (مثلاً: https://wa.me/923261604808 یا https://facebook.com)
                  </p>

                  {/* Common Presets */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: 'WhatsApp Support', url: 'https://wa.me/923261604808' },
                      { name: 'Facebook Page', url: 'https://facebook.com' },
                      { name: 'Instagram', url: 'https://instagram.com' },
                      { name: 'Google Search', url: 'https://google.com' }
                    ].map((ext, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setLinkUrl(ext.url);
                          setLinkOpenInNewTab(true);
                          if (!linkText || linkText === 'Click Here') setLinkText(ext.name);
                        }}
                        className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] rounded-lg text-zinc-300 hover:text-white cursor-pointer"
                      >
                        + {ext.name}
                      </button>
                    ))}
                  </div>

                  {/* Checkbox Options */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-xs">
                    <label className="flex items-center space-x-2 cursor-pointer text-zinc-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={linkOpenInNewTab}
                        onChange={(e) => setLinkOpenInNewTab(e.target.checked)}
                        className="rounded border-zinc-700 text-[#0F9D58] focus:ring-0 bg-zinc-900"
                      />
                      <span>Open link in a new tab (target="_blank")</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer text-zinc-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={linkNofollow}
                        onChange={(e) => setLinkNofollow(e.target.checked)}
                        className="rounded border-zinc-700 text-[#0F9D58] focus:ring-0 bg-zinc-900"
                      />
                      <span>Add rel="nofollow" (گوگل سرچ انجن کے لیے nofollow)</span>
                    </label>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between gap-2">
              <div>
                {hasExistingLink && (
                  <button
                    type="button"
                    onClick={handleRemoveLink}
                    className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Remove Link
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyLink()}
                  className="px-5 py-1.5 bg-[#0F9D58] hover:bg-[#0b8043] text-white text-xs font-black rounded-xl transition-all shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <LinkIcon size={13} />
                  <span>Insert Link (لنک لگائیں)</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
