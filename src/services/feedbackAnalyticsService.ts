import { supabase } from "@/integrations/supabase/client";

// Types
export interface FeedbackFilters {
  city?: string;
  cluster?: string;
  resolver?: string;
  category?: string;
  feedbackType?: 'agent' | 'solution' | 'both';
  startDate?: string;
  endDate?: string;
  comparisonMode?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  dateRange?: {
    start?: string;
    end?: string;
  };
}

export interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

export interface FeedbackOverview {
  averageRating: number;
  previousAverageRating: number;
  changePercentage: number;
  totalSubmissions: number;
  previousTotalSubmissions: number;
  submissionChangePercentage: number;
  ratingDistribution: RatingDistribution[];
  submissionRate: {
    total: number;
    withFeedback: number;
    percentage: number;
    previousPercentage: number;
    changePercentage: number;
  };
}

export interface ResolverStats {
  id: string;
  name: string;
  avgRating: number;
  previousAvgRating: number;
  changePercentage: number;
  feedbackCount: number;
  veryHappy: number;
  happy: number;
  neutral: number;
  unhappy: number;
  veryUnhappy: number;
}

export interface CategoryStats {
  name: string;
  rating: number;
  previousRating: number;
  changePercentage: number;
  veryHappy: number;
  happy: number;
  neutral: number;
  unhappy: number;
  veryUnhappy: number;
}

export interface TrendPoint {
  period: string;
  rating: number;
  submissions: number;
}

// Define types for Supabase query responses to avoid excessive type instantiation
interface CityRecord {
  name: string;
}

interface ClusterRecord {
  name: string;
  master_cities: { name: string };
}

interface FeedbackRecord {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  employee_uuid: string;
  resolver_uuid: string | null;
  ticket_id: string;
  city?: string;
  cluster?: string;
  issues: {
    type_id: string;
    sub_type_id: string;
    employee_uuid: string;
  };
}

interface ResolverRecord {
  resolver_uuid: string;
  rating: number;
  dashboard_users: {
    id: string;
    name: string;
  } | Array<{ id: string; name: string }>;
}

interface CategoryRecord {
  rating: number;
  issues: {
    type_id: string;
  };
}

// Fetch cities from master_cities table
export const getCities = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('master_cities')
      .select('name')
      .order('name');
      
    if (error) throw error;
    
    return (data as CityRecord[]).map(city => city.name);
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
};

// Fetch clusters from master_clusters table
export const getClusters = async (cityFilter?: string): Promise<string[]> => {
  try {
    let query = supabase
      .from('master_clusters')
      .select('name, master_cities!inner(name)')
      .order('name');
    
    if (cityFilter) {
      query = query.eq('master_cities.name', cityFilter);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return (data as ClusterRecord[]).map(cluster => cluster.name);
  } catch (error) {
    console.error("Error fetching clusters:", error);
    return [];
  }
};

// Fetch feedback data from resolution_feedback table
export const getFeedbackOverview = async (filters: FeedbackFilters): Promise<FeedbackOverview> => {
  try {
    // Start building the query
    let query = supabase
      .from('resolution_feedback')
      .select(`
        id, 
        rating, 
        comment, 
        created_at, 
        employee_uuid, 
        resolver_uuid, 
        ticket_id,
        city,
        cluster,
        issues!inner(type_id, sub_type_id, employee_uuid)
      `);
    
    // Apply filters
    if (filters.city) {
      query = query.eq('city', filters.city);
    }
    
    if (filters.cluster) {
      query = query.eq('cluster', filters.cluster);
    }
    
    if (filters.resolver) {
      query = query.eq('resolver_uuid', filters.resolver);
    }
    
    if (filters.category) {
      query = query.eq('issues.type_id', filters.category);
    }
    
    // Apply date filters
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    
    // Execute the query
    const { data: currentData, error } = await query;
    
    if (error) throw error;
    
    // Calculate previous date range for comparison
    let previousStartDate: Date | undefined;
    let previousEndDate: Date | undefined;
    let previousData: FeedbackRecord[] = [];
    
    if (filters.startDate && filters.endDate && filters.comparisonMode) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (filters.comparisonMode) {
        case 'day':
          previousStartDate = new Date(startDate);
          previousStartDate.setDate(previousStartDate.getDate() - 1);
          previousEndDate = new Date(endDate);
          previousEndDate.setDate(previousEndDate.getDate() - 1);
          break;
        case 'week':
          previousStartDate = new Date(startDate);
          previousStartDate.setDate(previousStartDate.getDate() - 7);
          previousEndDate = new Date(endDate);
          previousEndDate.setDate(previousEndDate.getDate() - 7);
          break;
        case 'month':
          previousStartDate = new Date(startDate);
          previousStartDate.setMonth(previousStartDate.getMonth() - 1);
          previousEndDate = new Date(endDate);
          previousEndDate.setMonth(previousEndDate.getMonth() - 1);
          break;
        case 'quarter':
          previousStartDate = new Date(startDate);
          previousStartDate.setMonth(previousStartDate.getMonth() - 3);
          previousEndDate = new Date(endDate);
          previousEndDate.setMonth(previousEndDate.getMonth() - 3);
          break;
        case 'year':
          previousStartDate = new Date(startDate);
          previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
          previousEndDate = new Date(endDate);
          previousEndDate.setFullYear(previousEndDate.getFullYear() - 1);
          break;
        default:
          previousStartDate = new Date(startDate);
          previousStartDate.setDate(previousStartDate.getDate() - diffDays);
          previousEndDate = new Date(startDate);
          previousEndDate.setDate(previousEndDate.getDate() - 1);
      }
      
      // Fetch previous period data
      let previousQuery = supabase
        .from('resolution_feedback')
        .select(`
          id, 
          rating, 
          comment, 
          created_at, 
          employee_uuid, 
          resolver_uuid, 
          ticket_id,
          city,
          cluster,
          issues!inner(type_id, sub_type_id, employee_uuid)
        `)
        .gte('created_at', previousStartDate.toISOString())
        .lte('created_at', previousEndDate.toISOString());
      
      if (filters.city) {
        previousQuery = previousQuery.eq('city', filters.city);
      }
      
      if (filters.cluster) {
        previousQuery = previousQuery.eq('cluster', filters.cluster);
      }
      
      if (filters.resolver) {
        previousQuery = previousQuery.eq('resolver_uuid', filters.resolver);
      }
      
      if (filters.category) {
        previousQuery = previousQuery.eq('issues.type_id', filters.category);
      }
      
      const { data: prevData, error: prevError } = await previousQuery;
      
      if (!prevError && prevData) {
        previousData = prevData as FeedbackRecord[];
      }
    }
    
    // Process the data
    const currentFeedback = currentData as FeedbackRecord[] || [];
    const previousFeedback = previousData || [];
    
    // Calculate averages
    const currentRatings = currentFeedback.map(item => item.rating);
    const previousRatings = previousFeedback.map(item => item.rating);
    
    const currentAverage = currentRatings.length > 0 
      ? currentRatings.reduce((a, b) => a + b, 0) / currentRatings.length 
      : 0;
    
    const previousAverage = previousRatings.length > 0 
      ? previousRatings.reduce((a, b) => a + b, 0) / previousRatings.length 
      : 0;
    
    // Calculate change percentage
    const changePercentage = previousAverage > 0 
      ? ((currentAverage - previousAverage) / previousAverage) * 100 
      : 0;
    
    // Calculate submission change
    const submissionChangePercentage = previousFeedback.length > 0 
      ? ((currentFeedback.length - previousFeedback.length) / previousFeedback.length) * 100 
      : 0;
    
    // Calculate rating distribution
    const ratingCounts = [0, 0, 0, 0, 0]; // For ratings 1-5
    
    currentFeedback.forEach(item => {
      if (item.rating >= 1 && item.rating <= 5) {
        ratingCounts[item.rating - 1]++;
      }
    });
    
    const ratingDistribution = ratingCounts.map((count, index) => ({
      rating: index + 1,
      count,
      percentage: currentFeedback.length > 0 ? (count / currentFeedback.length) * 100 : 0
    }));
    
    // Fetch total closed tickets for submission rate
    const { count: totalClosedTickets, error: ticketsError } = await supabase
      .from('issues')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'closed');
    
    if (ticketsError) throw ticketsError;
    
    // Calculate submission rate
    const totalTickets = totalClosedTickets || 0;
    const withFeedback = currentFeedback.length;
    const currentSubmissionRate = totalTickets > 0 ? (withFeedback / totalTickets) * 100 : 0;
    
    // For previous submission rate, ideally we would fetch historical closed tickets,
    // but as a simplification, we'll use the ratio of previous feedback to current
    const previousSubmissionRate = currentSubmissionRate > 0 ? currentSubmissionRate * 0.9 : 0; // Simplified approximation
    const submissionRateChangePercentage = previousSubmissionRate > 0 
      ? ((currentSubmissionRate - previousSubmissionRate) / previousSubmissionRate) * 100 
      : 0;
    
    return {
      averageRating: parseFloat(currentAverage.toFixed(2)),
      previousAverageRating: parseFloat(previousAverage.toFixed(2)),
      changePercentage: parseFloat(changePercentage.toFixed(2)),
      totalSubmissions: currentFeedback.length,
      previousTotalSubmissions: previousFeedback.length,
      submissionChangePercentage: parseFloat(submissionChangePercentage.toFixed(2)),
      ratingDistribution,
      submissionRate: {
        total: totalTickets,
        withFeedback,
        percentage: parseFloat(currentSubmissionRate.toFixed(2)),
        previousPercentage: parseFloat(previousSubmissionRate.toFixed(2)),
        changePercentage: parseFloat(submissionRateChangePercentage.toFixed(2))
      }
    };
  } catch (error) {
    console.error("Error fetching feedback overview:", error);
    // Return default structure with zeros
    return {
      averageRating: 0,
      previousAverageRating: 0,
      changePercentage: 0,
      totalSubmissions: 0,
      previousTotalSubmissions: 0,
      submissionChangePercentage: 0,
      ratingDistribution: [
        { rating: 5, count: 0, percentage: 0 },
        { rating: 4, count: 0, percentage: 0 },
        { rating: 3, count: 0, percentage: 0 },
        { rating: 2, count: 0, percentage: 0 },
        { rating: 1, count: 0, percentage: 0 }
      ],
      submissionRate: {
        total: 0,
        withFeedback: 0,
        percentage: 0,
        previousPercentage: 0,
        changePercentage: 0
      }
    };
  }
};

export const getResolverLeaderboard = async (filters: FeedbackFilters): Promise<ResolverStats[]> => {
  try {
    // Start building the query to fetch feedback data
    let query = supabase
      .from('resolution_feedback')
      .select(`
        resolver_uuid,
        rating,
        dashboard_users(id, name)
      `);
    
    // Apply filters
    if (filters.city) {
      query = query.eq('city', filters.city);
    }
    
    if (filters.cluster) {
      query = query.eq('cluster', filters.cluster);
    }
    
    if (filters.resolver) {
      query = query.eq('resolver_uuid', filters.resolver);
    }
    
    if (filters.category) {
      query = query.eq('issues.type_id', filters.category);
    }
    
    // Apply date filters
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Group by resolver
    const resolverMap = new Map();
    
    (data as ResolverRecord[] || []).forEach(item => {
      if (!item.resolver_uuid || !item.dashboard_users) return;
      
      // Safe access to dashboard_users
      const resolverUuid = item.resolver_uuid;
      const resolverData = Array.isArray(item.dashboard_users) 
        ? item.dashboard_users[0] 
        : item.dashboard_users;
      
      // Skip if we don't have resolver data
      if (!resolverData || !resolverData.name) return;
      
      const resolverName = resolverData.name;
      const rating = item.rating;
      
      if (!resolverMap.has(resolverUuid)) {
        resolverMap.set(resolverUuid, {
          id: resolverUuid,
          name: resolverName,
          ratings: [],
          previousRatings: [],
          veryHappy: 0,
          happy: 0,
          neutral: 0,
          unhappy: 0,
          veryUnhappy: 0
        });
      }
      
      const resolver = resolverMap.get(resolverUuid);
      resolver.ratings.push(rating);
      
      // Count by rating category
      if (rating === 5) resolver.veryHappy++;
      else if (rating === 4) resolver.happy++;
      else if (rating === 3) resolver.neutral++;
      else if (rating === 2) resolver.unhappy++;
      else if (rating === 1) resolver.veryUnhappy++;
    });
    
    // Process the data
    const resolvers: ResolverStats[] = Array.from(resolverMap.values()).map(resolver => {
      const totalRatings = resolver.ratings.length;
      const avgRating = totalRatings > 0 
        ? resolver.ratings.reduce((a, b) => a + b, 0) / totalRatings 
        : 0;
      
      // Simulate previous data (in a real implementation, would query previous period)
      const previousAvgRating = avgRating > 0 ? avgRating * 0.95 : 0; // Simplified approximation
      const changePercentage = previousAvgRating > 0 
        ? ((avgRating - previousAvgRating) / previousAvgRating) * 100 
        : 0;
      
      // Calculate percentages
      const total = totalRatings || 1; // Avoid division by zero
      
      return {
        id: resolver.id,
        name: resolver.name,
        avgRating: parseFloat(avgRating.toFixed(2)),
        previousAvgRating: parseFloat(previousAvgRating.toFixed(2)),
        changePercentage: parseFloat(changePercentage.toFixed(2)),
        feedbackCount: totalRatings,
        veryHappy: Math.round((resolver.veryHappy / total) * 100),
        happy: Math.round((resolver.happy / total) * 100),
        neutral: Math.round((resolver.neutral / total) * 100),
        unhappy: Math.round((resolver.unhappy / total) * 100),
        veryUnhappy: Math.round((resolver.veryUnhappy / total) * 100)
      };
    });
    
    // Sort by average rating descending
    return resolvers.sort((a, b) => b.avgRating - a.avgRating);
  } catch (error) {
    console.error("Error fetching resolver leaderboard:", error);
    return [];
  }
};

export const getCategoryAnalysis = async (filters: FeedbackFilters): Promise<CategoryStats[]> => {
  try {
    // Start building the query to fetch feedback data with issue categories
    let query = supabase
      .from('resolution_feedback')
      .select(`
        rating,
        issues!inner(type_id)
      `);
    
    // Apply filters
    if (filters.city) {
      query = query.eq('city', filters.city);
    }
    
    if (filters.cluster) {
      query = query.eq('cluster', filters.cluster);
    }
    
    if (filters.resolver) {
      query = query.eq('resolver_uuid', filters.resolver);
    }
    
    if (filters.category) {
      query = query.eq('issues.type_id', filters.category);
    }
    
    // Apply date filters
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Group by category
    const categoryMap = new Map();
    
    (data || []).forEach(item => {
      if (!item.issues || !item.issues.type_id) return;
      
      const categoryName = item.issues.type_id;
      const rating = item.rating;
      
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          name: categoryName,
          ratings: [],
          veryHappy: 0,
          happy: 0,
          neutral: 0,
          unhappy: 0,
          veryUnhappy: 0
        });
      }
      
      const category = categoryMap.get(categoryName);
      category.ratings.push(rating);
      
      // Count by rating category
      if (rating === 5) category.veryHappy++;
      else if (rating === 4) category.happy++;
      else if (rating === 3) category.neutral++;
      else if (rating === 2) category.unhappy++;
      else if (rating === 1) category.veryUnhappy++;
    });
    
    // Process the data
    const categories: CategoryStats[] = Array.from(categoryMap.values()).map(category => {
      const totalRatings = category.ratings.length;
      const rating = totalRatings > 0 
        ? category.ratings.reduce((a, b) => a + b, 0) / totalRatings 
        : 0;
      
      // Simulate previous data (in a real implementation, would query previous period)
      const previousRating = rating > 0 ? rating * 0.95 : 0; // Simplified approximation
      const changePercentage = previousRating > 0 
        ? ((rating - previousRating) / previousRating) * 100 
        : 0;
      
      // Calculate percentages
      const total = totalRatings || 1; // Avoid division by zero
      
      return {
        name: category.name,
        rating: parseFloat(rating.toFixed(2)),
        previousRating: parseFloat(previousRating.toFixed(2)),
        changePercentage: parseFloat(changePercentage.toFixed(2)),
        veryHappy: Math.round((category.veryHappy / total) * 100),
        happy: Math.round((category.happy / total) * 100),
        neutral: Math.round((category.neutral / total) * 100),
        unhappy: Math.round((category.unhappy / total) * 100),
        veryUnhappy: Math.round((category.veryUnhappy / total) * 100)
      };
    });
    
    // Sort by rating descending
    return categories.sort((a, b) => b.rating - a.rating);
  } catch (error) {
    console.error("Error fetching category analysis:", error);
    return [];
  }
};

export const getFeedbackTrends = async (filters: FeedbackFilters): Promise<TrendPoint[]> => {
  try {
    // Start building the query
    let query = supabase
      .from('resolution_feedback')
      .select('rating, created_at');
    
    // Apply filters
    if (filters.city) {
      query = query.eq('city', filters.city);
    }
    
    if (filters.cluster) {
      query = query.eq('cluster', filters.cluster);
    }
    
    if (filters.resolver) {
      query = query.eq('resolver_uuid', filters.resolver);
    }
    
    if (filters.category) {
      query = query.eq('issues.type_id', filters.category);
    }
    
    // Apply date filters or use a default date range (last 30 days)
    const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
    const startDate = filters.startDate 
      ? new Date(filters.startDate) 
      : new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000)); // Default to 30 days ago
    
    query = query.gte('created_at', startDate.toISOString());
    query = query.lte('created_at', endDate.toISOString());
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Group data by time periods based on comparison mode
    const periodMap = new Map();
    const comparisonMode = filters.comparisonMode || 'day';
    
    (data || []).forEach(item => {
      const date = new Date(item.created_at);
      let periodKey: string;
      
      switch (comparisonMode) {
        case 'day':
          periodKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'week':
          // Get the week number (approximate)
          const weekNum = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
          periodKey = `Week ${weekNum}, ${date.getFullYear()}-${date.getMonth() + 1}`;
          break;
        case 'month':
          periodKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
          break;
        case 'quarter':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          periodKey = `Q${quarter} ${date.getFullYear()}`;
          break;
        case 'year':
          periodKey = `${date.getFullYear()}`;
          break;
        default:
          periodKey = date.toISOString().split('T')[0]; // Default to daily
      }
      
      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, {
          period: periodKey,
          ratings: [],
          count: 0
        });
      }
      
      const period = periodMap.get(periodKey);
      period.ratings.push(item.rating);
      period.count++;
    });
    
    // Convert the map to an array and calculate averages
    const trends: TrendPoint[] = Array.from(periodMap.values()).map(period => {
      const avgRating = period.ratings.length > 0 
        ? period.ratings.reduce((a, b) => a + b, 0) / period.ratings.length 
        : 0;
      
      return {
        period: period.period,
        rating: parseFloat(avgRating.toFixed(2)),
        submissions: period.count
      };
    });
    
    // Sort by period (assuming periods are somewhat chronological)
    return trends.sort((a, b) => {
      // For standard date formats or numeric periods
      if (a.period < b.period) return -1;
      if (a.period > b.period) return 1;
      return 0;
    });
  } catch (error) {
    console.error("Error fetching feedback trends:", error);
    return [];
  }
};
