import { queue } from '@/worker/queue';
import { fetchSERP } from '../services';


const keyword = process.argv.slice(2).join(' ');

if (!keyword) {
  console.error('❌ keyword required');
  process.exit(1);
}

(async () => {
  const results = await fetchSERP(keyword);

  for (const r of results) {
    await queue.add('crawl:url', {
      url: r.url,
      keyword,
      position: r.position,
    });
  }

  console.log(`✅ Seeded ${results.length} URLs for "${keyword}"`);
  process.exit(0);
})();
