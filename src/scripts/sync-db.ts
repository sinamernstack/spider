import { AppDataSource } from '../data-source';

async function sync() {
  try {
    await AppDataSource.initialize();
    console.log('Connected, syncing schema (synchronize=true)');
    await AppDataSource.synchronize();
    console.log('Sync complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

sync();
