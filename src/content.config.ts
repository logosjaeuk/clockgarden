import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    categorySlug: z.string(),
    tags: z.array(z.string()),
    pubDate: z.string(),
    updatedDate: z.string().optional(),
    author: z.string(),
    authorRole: z.string().default('시계공학 및 정밀계측 전문위원'),
    readTime: z.number().default(5),
    featured: z.boolean().default(false),
    coverImage: z.string().optional(),
    coverAlt: z.string().optional(),
    locale: z.enum(['ko', 'en']).default('ko'),
  }),
});

export const collections = { articles };
