import { AppDataSource } from '../data-source';

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Running pending migrations...');
    const res = await AppDataSource.runMigrations();
    console.log('Migrations finished:', res.map(r => r.name));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
