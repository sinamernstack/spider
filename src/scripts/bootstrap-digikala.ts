import { AppDataSource } from '../data-source';
import { Domain } from '../entities/Domain';
import { Project } from '../entities/Project';
import { Keyword } from '../entities/Keyword';
import { RankCheck } from '../entities/RankCheck';

async function run() {
  try {
    console.log('Bootstrap: digikala — initializing DB...');
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();

    const domainRepo = AppDataSource.getRepository(Domain);
    const projectRepo = AppDataSource.getRepository(Project);
    const kwRepo = AppDataSource.getRepository(Keyword);
    const rcRepo = AppDataSource.getRepository(RankCheck);

    // Ensure domain exists
    let domain: any = await domainRepo.findOne({ where: { host: 'digikala.ir' } });
    if (!domain) {
      const created = await domainRepo.save({ host: 'digikala.ir', canonical_url: 'https://www.digikala.ir' } as any);
      domain = created;
      console.log('Created domain:', domain.id, domain.host);
    } else {
      console.log('Found existing domain:', domain.id, domain.host);
    }

    // Create project
    let project: any = await projectRepo.save({ name: 'Digikala Tracker', domain: domain } as any);
    console.log('Created project:', project.id, project.name);

    // Keywords to add
    const keywords = [
      'خرید لپ تاپ',
      'قیمت گوشی سامسونگ',
      'قیمت تلویزیون',
      'خرید موبایل',
      'خرید هدفون'
    ];

    const addedKeywords: any[] = [];
    for (const k of keywords) {
      const exists = await kwRepo.findOne({ where: { project_id: project.id, normalized_keyword: k.toLowerCase() } }) as any;
      if (exists) {
        addedKeywords.push(exists);
        continue;
      }
      const saved = await kwRepo.save({ project_id: project.id, keyword: k, normalized_keyword: k.toLowerCase(), language: 'fa' } as any);
      addedKeywords.push(saved);
      console.log('Added keyword:', saved.id, saved.keyword);
    }

    // Schedule an immediate rank check
    const savedRc: any = await rcRepo.save({ project_id: project.id, scheduled_at: new Date() } as any);
    console.log('Created rank_check:', savedRc.id, 'for project', project.id);

    console.log('\nSummary:');
    console.log('  domain_id:', domain.id);
    console.log('  project_id:', project.id);
    console.log('  keyword_ids:', addedKeywords.map(k => k.id).join(', '));
    console.log('  rank_check_id:', savedRc.id);

    process.exit(0);
  } catch (err) {
    console.error('Bootstrap failed:', err);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  }
}

run();
