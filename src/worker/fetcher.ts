import axios, { AxiosRequestConfig } from 'axios';
import cheerio from 'cheerio';

/**
 * -------------------------
 * Types
 * -------------------------
 */

export type SerpResult = {
  position: number;
  url: string;
  title?: string;
  snippet?: string;
  is_ad?: boolean;
};

export type SerpOptions = {
  country?: string;   // e.g. "us", "de"
  language?: string;  // e.g. "en-US", "fa"
  ua?: string;
  proxy?: string;
  timeout?: number;
};

/**
 * -------------------------
 * Constants
 * -------------------------
 */

const DEFAULT_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const GOOGLE_BASE = 'https://www.google.com/search';

/**
 * -------------------------
 * Helpers
 * -------------------------
 */

function buildGoogleUrl(keyword: string, opts: SerpOptions) {
  const q = encodeURIComponent(keyword);
  const hl = opts.language || 'en';
  const gl = opts.country || 'us';

  return `${GOOGLE_BASE}?q=${q}&num=10&hl=${hl}&gl=${gl}`;
}

function isBlocked(html: string) {
  return (
    html.includes('Our systems have detected unusual traffic') ||
    html.includes('/sorry/') ||
    html.toLowerCase().includes('captcha')
  );
}

/**
 * -------------------------
 * Google SERP Scraper (best-effort)
 * -------------------------
 */

export async function fetchSERPByGoogle(
  keyword: string,
  options: SerpOptions = {}
): Promise<SerpResult[]> {
  const url = buildGoogleUrl(keyword, options);

  const headers = {
    'User-Agent': options.ua || DEFAULT_UA,
    'Accept-Language': options.language || 'en-US,en;q=0.9',
  };

  const axiosOpts: AxiosRequestConfig = {
    headers,
    timeout: options.timeout ?? 15000,
  };

  // optional proxy
  if (options.proxy) {
    axiosOpts.proxy = {
      host: options.proxy.split(':')[0],
      port: Number(options.proxy.split(':')[1]),
    };
  }

  const res = await axios.get<string>(url, axiosOpts);
  const html = res.data;

  if (isBlocked(html)) {
    throw new Error('Google blocked the request (captcha / unusual traffic)');
  }

  const $ = cheerio.load(html);
  const results: SerpResult[] = [];

  /**
   * Primary parser (organic results)
   */
  $('div.g').each((_, el) => {
    if (results.length >= 10) return;

    const link = $(el).find('a').first();
    const href = link.attr('href');
    if (!href || !href.startsWith('http')) return;

    const title =
      link.find('h3').text().trim() ||
      $(el).find('h3').text().trim() ||
      undefined;

    const snippet =
      $(el).find('.VwiC3b').text().trim() ||
      $(el).find('.IsZvec').text().trim() ||
      undefined;

    results.push({
      position: results.length + 1,
      url: href,
      title,
      snippet,
      is_ad: false,
    });
  });

  /**
   * Fallback parser
   */
  if (results.length === 0) {
    $('a').each((_, el) => {
      if (results.length >= 10) return;

      const href = $(el).attr('href');
      if (!href?.startsWith('/url?q=')) return;

      const clean = href.replace('/url?q=', '').split('&')[0];
      results.push({
        position: results.length + 1,
        url: decodeURIComponent(clean),
      });
    });
  }

  return results;
}

/**
 * -------------------------
 * Unified SERP fetcher
 * Priority:
 * 1) SERP API (legal & stable)
 * 2) Google scraping (fallback)
 * -------------------------
 */

export async function fetchSERP(
  keyword: string,
  options: SerpOptions = {}
): Promise<SerpResult[]> {
  /**
   * If SERP API configured (recommended)
   */
  if (process.env.SERP_API_URL) {
    try {
      const res = await axios.post(
        process.env.SERP_API_URL,
        {
          q: keyword,
          country: options.country,
          language: options.language,
        },
        {
          timeout: options.timeout ?? 20000,
          headers: process.env.SERP_API_KEY
            ? { Authorization: `Bearer ${process.env.SERP_API_KEY}` }
            : undefined,
        }
      );

      return res.data?.results ?? [];
    } catch (err) {
      console.warn('[SERP API FAILED] Falling back to Google scrape');
    }
  }

  /**
   * Fallback: scrape Google directly
   */
  return fetchSERPByGoogle(keyword, options);
}

export default fetchSERP;
