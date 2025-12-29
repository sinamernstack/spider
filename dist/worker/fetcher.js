"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSERPByGoogle = fetchSERPByGoogle;
exports.fetchSERP = fetchSERP;
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
async function fetchSERPByGoogle(keyword, options = {}) {
    const q = encodeURIComponent(keyword);
    const url = `https://www.google.com/search?q=${q}&num=10`;
    const headers = {
        'User-Agent': options.ua || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36',
        'Accept-Language': options.language || 'en-US,en;q=0.9',
    };
    const axiosOpts = { headers, timeout: 15000 };
    if (options.proxy)
        axiosOpts.proxy = options.proxy;
    const res = await axios_1.default.get(url, axiosOpts);
    const html = res.data;
    const $ = cheerio_1.default.load(html);
    const results = [];
    // Google's markup is complex; this is a best-effort parser for organic results
    $('div.g').each((i, el) => {
        const a = $(el).find('a').first();
        const href = a.attr('href') || '';
        const title = a.find('h3').text() || a.text() || undefined;
        const snippet = $(el).find('.IsZvec').text() || $(el).find('.VwiC3b').text() || undefined;
        if (!href)
            return;
        results.push({ position: results.length + 1, url: href, title, snippet, is_ad: false });
    });
    // fallback: parse search result links
    if (results.length === 0) {
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.startsWith('/url?q=')) {
                const clean = href.replace('/url?q=', '').split('&')[0];
                results.push({ position: results.length + 1, url: decodeURIComponent(clean) });
            }
        });
    }
    return results.slice(0, 10);
}
async function fetchSERP(keyword, opts = {}) {
    // If SERP_API_URL provided, prefer that (safer/legal)
    if (process.env.SERP_API_URL) {
        const apiKey = process.env.SERP_API_KEY;
        const res = await axios_1.default.post(process.env.SERP_API_URL, { q: keyword, options: opts }, { headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined, timeout: 20000 });
        // expect provider to return results array
        return res.data.results || [];
    }
    // otherwise try fetching Google directly (best-effort)
    return fetchSERPByGoogle(keyword, { language: opts.language, ua: opts.ua, proxy: opts.proxy });
}
exports.default = fetchSERP;
