import { seedOriginalSupabaseData } from './seedOriginalData';

async function runSeed() {
  try {
    console.log("Starting to seed original Supabase data...");
    await seedOriginalSupabaseData();
    console.log("✅ All original data seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
}

runSeed();