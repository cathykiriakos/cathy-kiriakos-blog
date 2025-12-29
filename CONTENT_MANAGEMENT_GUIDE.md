# Content Management Guide

Welcome to your blog's content management guide! This document explains how to add and manage content on your site.

## Quick Start

Your blog now has all placeholder content removed. To add your own content:

1. **Visit the Admin Panel**: Navigate to `/admin` on your site
2. **Add Content**: Use the admin interface to create posts, articles, and featured content
3. **Choose Images**: Select the best image for each piece of content (similar to Pinterest's pin selection)

## Current Content Sections

### 1. Featured Introduction (Main Hero Section)
- **Location**: `src/components/FeaturedArticle.tsx`
- **Current Content**: Introduction to Cathy Kiriakos and Ni Data platform
- **How to Update**: Edit the `DefaultFeaturedArticle` component in `FeaturedArticle.tsx`

### 2. All Posts
- **Location**: `src/components/BlogGrid.tsx`
- **Status**: Empty - waiting for your content
- **Shows**: "No posts yet" message with link to admin panel

### 3. Editor's Pick
- **Location**: `src/components/EditorsPick.tsx`
- **Status**: Hidden until you add picks
- **How to Add**: Populate the `picks` array or fetch from Supabase

### 4. Trending Posts
- **Location**: `src/components/TrendingBlock.tsx`
- **Status**: Hidden until you add trending content
- **How to Add**: Populate the `trendingPosts` array or fetch from Supabase

### 5. Featured Stories (Masonry Grid)
- **Location**: `src/components/MasonryBlock.tsx`
- **Status**: Hidden until you add featured stories
- **How to Add**: Populate the `masonryPosts` array or fetch from Supabase

## Adding Content

### Method 1: Direct Code (Quick & Simple)

Add content directly to the component files:

```typescript
// Example: Adding posts to BlogGrid.tsx
const blogPosts = [
  {
    title: "Your Post Title",
    category: "AI & Technology",
    date: "2025-12-29",
    excerpt: "A brief description of your post...",
    image: "/path/to/your/image.jpg"
  },
  // Add more posts...
];
```

### Method 2: Supabase Integration (Recommended for Dynamic Content)

Fetch content from your Supabase database:

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const BlogGrid = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      setPosts(data || []);
    };

    fetchPosts();
  }, []);

  // Rest of component...
};
```

## Pinterest-Style Image Selection

To implement Pinterest-style image selection for your content:

### Overview
Pinterest allows users to choose which image best represents their content when pinning. We can implement a similar feature for your blog posts.

### Implementation Plan

#### 1. Image Upload & Selection Component

Create a new component for image management:

```typescript
// src/components/ImageSelector.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ImageSelectorProps {
  images: string[]; // Array of image URLs from your content
  onSelect: (imageUrl: string) => void;
  selectedImage?: string;
}

export const ImageSelector = ({ images, onSelect, selectedImage }: ImageSelectorProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map((image, index) => (
        <div
          key={index}
          onClick={() => onSelect(image)}
          className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
            selectedImage === image ? 'border-primary' : 'border-transparent'
          }`}
        >
          <img src={image} alt={`Option ${index + 1}`} className="w-full h-32 object-cover" />
          {selectedImage === image && (
            <div className="bg-primary text-white text-center py-1 text-sm">
              Selected
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
```

#### 2. Admin Panel Integration

Add the ImageSelector to your admin/content creation form:

```typescript
// In your admin form
const [featuredImage, setFeaturedImage] = useState<string>('');
const [contentImages, setContentImages] = useState<string[]>([]);

// When creating/editing content:
<ImageSelector
  images={contentImages}
  onSelect={setFeaturedImage}
  selectedImage={featuredImage}
/>
```

#### 3. Database Schema

Add a field to store the selected featured image:

```sql
-- In your posts table
ALTER TABLE posts
ADD COLUMN featured_image TEXT,
ADD COLUMN content_images TEXT[]; -- Array of all images in the content
```

#### 4. Automatic Image Detection

Automatically detect images from content:

```typescript
// Utility function to extract images from HTML content
export const extractImagesFromContent = (htmlContent: string): string[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const images = doc.querySelectorAll('img');

  return Array.from(images).map(img => img.src);
};

// Usage in your content editor
const handleContentChange = (content: string) => {
  const detectedImages = extractImagesFromContent(content);
  setContentImages(detectedImages);
};
```

### Example Workflow

1. **User writes a blog post** with multiple images in the content
2. **System detects all images** automatically from the content
3. **User selects the best image** using the ImageSelector component
4. **Selected image is used** as the featured/preview image in blog cards
5. **All images are stored** for future selection changes

## Social Media Configuration

Your social media links have been updated:

- **Header**: Shows LinkedIn and Instagram icons
- **Footer**: Shows LinkedIn and Instagram links
- **Social Share**: Only shows LinkedIn sharing option

To update your social media URLs:

1. **Header**: Edit `src/components/Header.tsx` - Update `socialLinks` array
2. **Footer**: Edit `src/components/Footer.tsx` - Update the Connect section

```typescript
// Example: Adding your LinkedIn URL
const socialLinks = [
  { icon: Linkedin, href: 'https://www.linkedin.com/in/your-profile', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://www.instagram.com/your-profile', label: 'Instagram' },
];
```

## Navigation

Your site navigation has been standardized:

**Header Navigation:**
- All Posts
- Market Intel
- Business & Technology
- Podcast

**Footer Navigation:** (Matches header for consistency)
- All Posts
- Market Intel
- Business & Technology
- Podcast

**Additional Footer Links:**
- About
- Contact
- Privacy
- Terms

## Best Practices

1. **Image Sizes**: Use consistent image dimensions for better visual consistency
   - Blog cards: 800x600px recommended
   - Featured article: 1200x900px recommended

2. **Content Organization**: Use categories consistently:
   - AI & Technology
   - Market Intelligence
   - Business & Innovation
   - Data & Analytics

3. **Dates**: Use ISO format (YYYY-MM-DD) for consistency

4. **Excerpts**: Keep excerpts to 120-150 characters for optimal display

## Need Help?

- Check the admin panel documentation at `/admin`
- Review component files for inline TODO comments
- Refer to Supabase documentation for database operations
