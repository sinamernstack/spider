import axios from 'axios';
import cheerio from 'cheerio';
import pRetry from 'p-retry';

import { randomUA } from '../utils/ua';
import { redis } from '@/infra/redis';

export type SerpResult = {
  position: number;
  url: string;
  title?: string;
  snippet?: string;
  is_ad?: boolean;
};

const CACHE_TTL = 60 * 60 * 6; // 6 hours

export async function fetchSERP(
  keyword: string,
  opts: { country?: string; language?: string; proxy?: string } = {}
): Promise<SerpResult[]> {

  const cacheKey = `serp:${keyword}:${opts.country || 'us'}:${opts.language || 'en'}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  let results: SerpResult[];

  if (process.env.SERP_API_URL) {
    results = await fetchViaAPI(keyword, opts);
  } else {
    results = await fetchViaGoogle(keyword, opts);
  }

  await redis.set(cacheKey, JSON.stringify(results), 'EX', CACHE_TTL);
  return results;
}

/* ================= API ================= */

async function fetchViaAPI(keyword: string, opts: any): Promise<SerpResult[]> {
  const res = await axios.post(
    process.env.SERP_API_URL!,
    { q: keyword, ...opts },
    {
      timeout: 20000,
      headers: process.env.SERP_API_KEY
        ? { Authorization: `Bearer ${process.env.SERP_API_KEY}` }
        : undefined,
    }
  );

  return res.data?.results || [];
}

/* ================= GOOGLE FALLBACK ================= */

async function fetchViaGoogle(keyword: string, opts: any): Promise<SerpResult[]> {
  return pRetry(async () => {
    const q = encodeURIComponent(keyword);
    const gl = opts.country || 'us';
    const hl = opts.language || 'en';

    const res = await axios.get(
      `https://www.google.com/search?q=${q}&num=10&gl=${gl}&hl=${hl}`,
      {
        timeout: 15000,
        headers: {
          'User-Agent': randomUA(),
          'Accept-Language': `${hl},en;q=0.9`,
        },
      }
    );

    return parseGoogle(res.data);
  }, { retries: 3 });
}

function parseGoogle(html: string): SerpResult[] {
  const $ = cheerio.load(html);
  const results: SerpResult[] = [];

  $('div.g').each((_, el) => {
    const a = $(el).find('a').first();
    const url = a.attr('href');
    const title = a.find('h3').text();
    const snippet = $(el).find('.VwiC3b').text();

    if (!url || !title) return;

    results.push({
      position: results.length + 1,
      url,
      title,
      snippet,
      is_ad: false,
    });
  });

  return results.slice(0, 10);
}
