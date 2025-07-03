import { db } from "./db";
import { employees, dashboardUsers, issues, issueComments, ticketFeedback } from "@shared/schema";
import { seedOriginalSupabaseData } from "./seedOriginalData";

async function clearExistingData() {
  try {
    console.log("Clearing existing minimal data...");
    
    // Delete in correct order to avoid foreign key constraints
    await db.delete(ticketFeedback);
    await db.delete(issueComments);
    await db.delete(issues);
    await db.delete(employees);
    await db.delete(dashboardUsers);
    
    console.log("✅ Existing data cleared");
  } catch (error) {
    console.error("Error clearing data:", error);
  }
}

async function runSeed() {
  try {
    console.log("🌱 Starting original Supabase data migration...");
    
    // Clear existing minimal data
    await clearExistingData();
    
    // Seed with original data
    const result = await seedOriginalSupabaseData();
    
    console.log("\n🎉 Original Supabase data migration completed!");
    console.log("Summary:");
    console.log(`- Dashboard Users: ${result.dashboardUsers.length}`);
    console.log(`- Employees: ${result.employees.length}`);
    console.log(`- Issues: ${result.issues.length}`);
    console.log(`- Comments: ${result.comments}`);
    console.log(`- Feedback: ${result.feedback}`);
    
  } catch (error) {
    console.error("❌ Error during data migration:", error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  runSeed().then(() => {
    console.log("Migration completed successfully!");
    process.exit(0);
  });
}

export { runSeed };