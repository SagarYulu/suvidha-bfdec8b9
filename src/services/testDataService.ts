
import { supabase } from "@/integrations/supabase/client";
import { SentimentRating, SentimentTag } from "./sentimentService";
import { format, subDays, subMonths, subQuarters, subYears } from "date-fns";

type Employee = {
  id: string;
  name: string;
  city?: string | null;
  cluster?: string | null;
  role?: string | null;
};

type TestPeriod = 'current-week' | 'last-week' | 'last-month' | 'last-quarter' | 'last-year';

/**
 * Generate test sentiment data for various time periods
 */
export const generateTestSentimentData = async (): Promise<{ success: boolean, count: number, error?: string }> => {
  try {
    console.log("Starting test data generation...");
    
    // Step 1: Fetch a subset of employees
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id, name, city, cluster, role')
      .order('name', { ascending: true })
      .limit(10); // Adjust the number of employees as needed
    
    if (empError) {
      console.error("Error fetching employees:", empError);
      return { success: false, count: 0, error: empError.message };
    }
    
    if (!employees || employees.length === 0) {
      console.error("No employees found");
      return { success: false, count: 0, error: "No employees found" };
    }
    
    // Step 2: Fetch all sentiment tags
    const { data: sentimentTags, error: tagError } = await supabase
      .from('sentiment_tags')
      .select('id, name, category');
    
    if (tagError || !sentimentTags || sentimentTags.length === 0) {
      console.error("Error fetching sentiment tags:", tagError);
      return { success: false, count: 0, error: tagError?.message || "No sentiment tags found" };
    }

    // Step 3: Define time periods
    const now = new Date();
    const periods: Record<TestPeriod, { start: Date, end: Date }> = {
      'current-week': {
        start: subDays(now, 7),
        end: now
      },
      'last-week': {
        start: subDays(now, 14),
        end: subDays(now, 8)
      },
      'last-month': {
        start: subDays(now, 30),
        end: subDays(now, 15)
      },
      'last-quarter': {
        start: subQuarters(now, 1),
        end: subMonths(now, 1)
      },
      'last-year': {
        start: subYears(now, 1),
        end: subQuarters(now, 1)
      }
    };
    
    // Step 4: Generate and insert test data
    const sentimentData: SentimentRating[] = [];
    
    for (const employee of employees) {
      // For each period, generate 2-3 ratings
      Object.entries(periods).forEach(([periodName, { start, end }]) => {
        // Determine how many entries for this period (2-3)
        const entryCount = Math.floor(Math.random() * 2) + 2; // 2-3
        
        for (let i = 0; i < entryCount; i++) {
          // Generate a random date within the period
          const randomDate = new Date(
            start.getTime() + Math.random() * (end.getTime() - start.getTime())
          );
          
          // Generate a random rating (1-5)
          const rating = Math.floor(Math.random() * 5) + 1;
          
          // Determine sentiment score and label based on rating
          let sentiment_score = (rating / 5) * 1.0;
          let sentiment_label: string;
          
          if (rating >= 4) {
            sentiment_label = 'positive';
          } else if (rating === 3) {
            sentiment_label = 'neutral';
          } else {
            sentiment_label = 'negative';
          }
          
          // Select 1-2 random tags
          const tagCount = Math.floor(Math.random() * 2) + 1; // 1-2
          const selectedTags = [...sentimentTags]
            .sort(() => 0.5 - Math.random())
            .slice(0, tagCount)
            .map(tag => tag.name);
          
          // Create sentiment record
          sentimentData.push({
            employee_id: employee.id,
            rating,
            sentiment_score,
            sentiment_label,
            tags: selectedTags,
            city: employee.city || undefined,
            cluster: employee.cluster || undefined,
            role: employee.role || undefined,
            created_at: format(randomDate, "yyyy-MM-dd'T'HH:mm:ss")
          });
        }
      });
    }
    
    console.log(`Generated ${sentimentData.length} test sentiment entries`);
    
    // Step 5: Insert the test data into the database
    const { error: insertError } = await supabase
      .from('employee_sentiment')
      .insert(sentimentData);
    
    if (insertError) {
      console.error("Error inserting test sentiment data:", insertError);
      return { success: false, count: 0, error: insertError.message };
    }
    
    return { success: true, count: sentimentData.length };
  } catch (error: any) {
    console.error("Error generating test sentiment data:", error);
    return { success: false, count: 0, error: error.message };
  }
};
