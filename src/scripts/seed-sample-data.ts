import { AppDataSource } from '../data-source';
import { Domain } from '../entities/Domain';
import { Project } from '../entities/Project';
import { ProjectSettings } from '../entities/ProjectSettings';
import { Keyword } from '../entities/Keyword';
import { Competitor } from '../entities/Competitor';
import { RankCheck } from '../entities/RankCheck';

async function seed() {
  try {
    await AppDataSource.initialize();
    const domainRepo = AppDataSource.getRepository(Domain);
    const projectRepo = AppDataSource.getRepository(Project);
    const psRepo = AppDataSource.getRepository(ProjectSettings);
    const kwRepo = AppDataSource.getRepository(Keyword);
    const compRepo = AppDataSource.getRepository(Competitor);
    const rcRepo = AppDataSource.getRepository(RankCheck);

    // Sample projects (3)
    const samples = [
      { name: 'Example Store', host: 'examplestore.test', keywords: ['red shoes', 'blue jacket'] },
      { name: 'Tech Blog', host: 'techblog.test', keywords: ['nodejs performance', 'postgres partitioning'] },
      { name: 'Local Cafe', host: 'localcafe.test', keywords: ['best coffee near me', 'cafe brunch'] },
    ];

    for (const s of samples) {
      let d = await domainRepo.findOne({ where: { host: s.host } });
      if (!d) d = domainRepo.create({ host: s.host, canonical_url: `https://${s.host}` });
      d = await domainRepo.save(d);

      let p = projectRepo.create({ name: s.name, domain: d } as any);
      p = await projectRepo.save(p);

      await psRepo.save({ project_id: (p as any).id, default_country: 'US', default_language: 'en-US', check_frequency_minutes: 1440 } as any);

      for (const k of s.keywords) {
        await kwRepo.save({ project_id: (p as any).id, keyword: k, normalized_keyword: k.toLowerCase() } as any);
      }

      // add a dummy competitor
      const compDomain = `${s.host.replace('.', '')}-competitor.test`;
      let cd = await domainRepo.findOne({ where: { host: compDomain } });
      if (!cd) cd = domainRepo.create({ host: compDomain, canonical_url: `https://${compDomain}` });
      cd = await domainRepo.save(cd);
      await compRepo.save({ project_id: (p as any).id, domain_id: (cd as any).id, label: 'Competitor 1' } as any);

      // schedule an immediate rank_check
      const rc = rcRepo.create({ project_id: (p as any).id, scheduled_at: new Date() } as any);
      await rcRepo.save(rc);
    }

    console.log('Seeding complete');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  }
}

seed();

seed();
