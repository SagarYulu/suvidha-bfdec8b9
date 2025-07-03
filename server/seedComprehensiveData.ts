import { storage } from "./storage";
import bcrypt from "bcryptjs";

export async function seedComprehensiveData() {
  try {
    console.log("Seeding comprehensive test data...");

    // Create dashboard users for different roles
    const dashboardUsers = [
      {
        name: "Rajesh Sharma",
        email: "rajesh.sharma@yulu.com",
        password: await bcrypt.hash("password123", 10),
        role: "Super Admin",
        phone: "+91-9876543210",
        city: "Bangalore",
        cluster: "Koramangala",
        dateOfJoining: "2022-01-15",
        bloodGroup: "O+",
        dateOfBirth: "1985-03-20",
        accountNumber: "1234567890",
        ifscCode: "HDFC0000123"
      },
      {
        name: "Priya Nair",
        email: "priya.nair@yulu.com",
        password: await bcrypt.hash("password123", 10),
        role: "City Head",
        phone: "+91-9876543211",
        city: "Mumbai",
        cluster: "Andheri",
        dateOfJoining: "2022-03-10",
        bloodGroup: "A+",
        dateOfBirth: "1987-07-15",
        accountNumber: "1234567891",
        ifscCode: "HDFC0000124"
      },
      {
        name: "Vikash Kumar",
        email: "vikash.kumar@yulu.com",
        password: await bcrypt.hash("password123", 10),
        role: "Cluster Head",
        phone: "+91-9876543212",
        city: "Delhi",
        cluster: "Connaught Place",
        dateOfJoining: "2022-05-01",
        bloodGroup: "B+",
        dateOfBirth: "1989-11-25",
        accountNumber: "1234567892",
        ifscCode: "HDFC0000125"
      },
      {
        name: "Sneha Patel",
        email: "sneha.patel@yulu.com",
        password: await bcrypt.hash("password123", 10),
        role: "HR Admin",
        phone: "+91-9876543213",
        city: "Bangalore",
        cluster: "HSR Layout",
        dateOfJoining: "2022-06-15",
        bloodGroup: "AB+",
        dateOfBirth: "1990-02-08",
        accountNumber: "1234567893",
        ifscCode: "HDFC0000126"
      },
      {
        name: "Amit Singh",
        email: "amit.singh@yulu.com",
        password: await bcrypt.hash("password123", 10),
        role: "Security Admin",
        phone: "+91-9876543214",
        city: "Mumbai",
        cluster: "Bandra",
        dateOfJoining: "2022-08-20",
        bloodGroup: "O-",
        dateOfBirth: "1986-09-12",
        accountNumber: "1234567894",
        ifscCode: "HDFC0000127"
      }
    ];

    // Create employees with diverse roles and locations
    const employees = [
      {
        name: "Rohit Verma",
        email: "rohit.verma@yulu.bike",
        password: await bcrypt.hash("EMP001", 10),
        empId: "EMP001",
        phone: "+91-8765432101",
        city: "Bangalore",
        cluster: "Koramangala",
        role: "Delivery Executive",
        manager: "Rajesh Sharma",
        dateOfJoining: "2023-01-15",
        bloodGroup: "O+",
        dateOfBirth: "1995-04-10",
        accountNumber: "2345678901",
        ifscCode: "HDFC0001234"
      },
      {
        name: "Anita Kumari",
        email: "anita.kumari@yulu.bike",
        password: await bcrypt.hash("EMP002", 10),
        empId: "EMP002",
        phone: "+91-8765432102",
        city: "Mumbai",
        cluster: "Andheri",
        role: "Delivery Executive",
        manager: "Priya Nair",
        dateOfJoining: "2023-02-01",
        bloodGroup: "A+",
        dateOfBirth: "1993-06-22",
        accountNumber: "2345678902",
        ifscCode: "HDFC0001235"
      },
      {
        name: "Suresh Yadav",
        email: "suresh.yadav@yulu.bike",
        password: await bcrypt.hash("EMP003", 10),
        empId: "EMP003",
        phone: "+91-8765432103",
        city: "Delhi",
        cluster: "Connaught Place",
        role: "Mechanic",
        manager: "Vikash Kumar",
        dateOfJoining: "2023-03-10",
        bloodGroup: "B+",
        dateOfBirth: "1991-12-05",
        accountNumber: "2345678903",
        ifscCode: "HDFC0001236"
      },
      {
        name: "Kavita Sharma",
        email: "kavita.sharma@yulu.bike",
        password: await bcrypt.hash("EMP004", 10),
        empId: "EMP004",
        phone: "+91-8765432104",
        city: "Bangalore",
        cluster: "HSR Layout",
        role: "Pilot",
        manager: "Sneha Patel",
        dateOfJoining: "2023-04-05",
        bloodGroup: "AB+",
        dateOfBirth: "1994-08-18",
        accountNumber: "2345678904",
        ifscCode: "HDFC0001237"
      },
      {
        name: "Deepak Gupta",
        email: "deepak.gupta@yulu.bike",
        password: await bcrypt.hash("EMP005", 10),
        empId: "EMP005",
        phone: "+91-8765432105",
        city: "Mumbai",
        cluster: "Bandra",
        role: "Marshal",
        manager: "Amit Singh",
        dateOfJoining: "2023-05-15",
        bloodGroup: "O-",
        dateOfBirth: "1992-01-30",
        accountNumber: "2345678905",
        ifscCode: "HDFC0001238"
      },
      {
        name: "Sunita Devi",
        email: "sunita.devi@yulu.bike",
        password: await bcrypt.hash("EMP006", 10),
        empId: "EMP006",
        phone: "+91-8765432106",
        city: "Bangalore",
        cluster: "Indiranagar",
        role: "Delivery Executive",
        manager: "Rajesh Sharma",
        dateOfJoining: "2023-06-01",
        bloodGroup: "A-",
        dateOfBirth: "1996-03-14",
        accountNumber: "2345678906",
        ifscCode: "HDFC0001239"
      },
      {
        name: "Manish Tiwari",
        email: "manish.tiwari@yulu.bike",
        password: await bcrypt.hash("EMP007", 10),
        empId: "EMP007",
        phone: "+91-8765432107",
        city: "Delhi",
        cluster: "Karol Bagh",
        role: "Delivery Executive",
        manager: "Vikash Kumar",
        dateOfJoining: "2023-07-10",
        bloodGroup: "B-",
        dateOfBirth: "1993-11-08",
        accountNumber: "2345678907",
        ifscCode: "HDFC0001240"
      },
      {
        name: "Rekha Singh",
        email: "rekha.singh@yulu.bike",
        password: await bcrypt.hash("EMP008", 10),
        empId: "EMP008",
        phone: "+91-8765432108",
        city: "Mumbai",
        cluster: "Powai",
        role: "Mechanic",
        manager: "Priya Nair",
        dateOfJoining: "2023-08-20",
        bloodGroup: "AB-",
        dateOfBirth: "1990-05-25",
        accountNumber: "2345678908",
        ifscCode: "HDFC0001241"
      }
    ];

    // Create dashboard users
    const createdDashboardUsers = [];
    for (const userData of dashboardUsers) {
      const user = await storage.createDashboardUser(userData);
      createdDashboardUsers.push(user);
      console.log(`Created dashboard user: ${user.name}`);
    }

    // Create employees
    const createdEmployees = [];
    for (const empData of employees) {
      const employee = await storage.createEmployee(empData);
      createdEmployees.push(employee);
      console.log(`Created employee: ${employee.name}`);
    }

    // Create diverse issues
    const issueTypes = [
      'salary', 'leave', 'grievance', 'technical', 'equipment', 'safety', 'training', 'policy'
    ];
    const priorities = ['low', 'medium', 'high', 'critical'];
    const statuses = ['open', 'in_progress', 'resolved', 'closed'];
    
    const issues = [
      {
        description: "Salary not credited for the month of November. Please resolve urgently.",
        issueType: "salary",
        priority: "high",
        status: "open",
        employeeId: createdEmployees[0].id,
        assignedTo: createdDashboardUsers[0].id.toString(),
        createdAt: new Date('2024-12-01T10:00:00Z'),
        updatedAt: new Date('2024-12-01T10:00:00Z')
      },
      {
        description: "Need leave approval for medical emergency. Application submitted but no response received.",
        issueType: "leave",
        priority: "medium",
        status: "in_progress",
        employeeId: createdEmployees[1].id,
        assignedTo: createdDashboardUsers[3].id.toString(),
        createdAt: new Date('2024-12-02T14:30:00Z'),
        updatedAt: new Date('2024-12-02T16:45:00Z')
      },
      {
        description: "Facing harassment from supervisor. Need immediate intervention.",
        issueType: "grievance",
        priority: "critical",
        status: "open",
        employeeId: createdEmployees[2].id,
        assignedTo: createdDashboardUsers[3].id.toString(),
        createdAt: new Date('2024-12-03T09:15:00Z'),
        updatedAt: new Date('2024-12-03T09:15:00Z')
      },
      {
        description: "Mobile app keeps crashing when trying to submit delivery reports.",
        issueType: "technical",
        priority: "medium",
        status: "in_progress",
        employeeId: createdEmployees[3].id,
        assignedTo: createdDashboardUsers[4].id.toString(),
        createdAt: new Date('2024-12-04T11:20:00Z'),
        updatedAt: new Date('2024-12-04T13:30:00Z')
      },
      {
        description: "Bike battery not charging properly. Need replacement urgently.",
        issueType: "equipment",
        priority: "high",
        status: "resolved",
        employeeId: createdEmployees[4].id,
        assignedTo: createdDashboardUsers[1].id.toString(),
        createdAt: new Date('2024-11-28T08:45:00Z'),
        updatedAt: new Date('2024-11-30T17:00:00Z')
      },
      {
        description: "Safety gear (helmet and reflective vest) is damaged and needs replacement.",
        issueType: "safety",
        priority: "high",
        status: "open",
        employeeId: createdEmployees[5].id,
        assignedTo: createdDashboardUsers[0].id.toString(),
        createdAt: new Date('2024-12-05T07:30:00Z'),
        updatedAt: new Date('2024-12-05T07:30:00Z')
      },
      {
        description: "Request for additional training on new delivery routes and traffic rules.",
        issueType: "training",
        priority: "low",
        status: "closed",
        employeeId: createdEmployees[6].id,
        assignedTo: createdDashboardUsers[2].id.toString(),
        createdAt: new Date('2024-11-25T12:00:00Z'),
        updatedAt: new Date('2024-11-27T18:00:00Z')
      },
      {
        description: "Unclear about new policy regarding overtime compensation. Need clarification.",
        issueType: "policy",
        priority: "medium",
        status: "resolved",
        employeeId: createdEmployees[7].id,
        assignedTo: createdDashboardUsers[3].id.toString(),
        createdAt: new Date('2024-11-20T15:30:00Z'),
        updatedAt: new Date('2024-11-22T10:15:00Z')
      },
      {
        description: "Bike lock is broken and I'm unable to secure the vehicle during deliveries.",
        issueType: "equipment",
        priority: "medium",
        status: "in_progress",
        employeeId: createdEmployees[0].id,
        assignedTo: createdDashboardUsers[1].id.toString(),
        createdAt: new Date('2024-12-06T16:45:00Z'),
        updatedAt: new Date('2024-12-06T18:20:00Z')
      },
      {
        description: "Overtime hours not being calculated correctly in the system.",
        issueType: "salary",
        priority: "high",
        status: "open",
        employeeId: createdEmployees[2].id,
        assignedTo: createdDashboardUsers[0].id.toString(),
        createdAt: new Date('2024-12-07T08:00:00Z'),
        updatedAt: new Date('2024-12-07T08:00:00Z')
      }
    ];

    // Create issues
    const createdIssues = [];
    for (const issueData of issues) {
      const issue = await storage.createIssue(issueData);
      createdIssues.push(issue);
      console.log(`Created issue: ${issue.description.substring(0, 50)}...`);
    }

    // Create issue comments
    const comments = [
      {
        issueId: createdIssues[0].id,
        content: "I have forwarded your salary issue to the finance team. They will resolve it within 24 hours.",
        employeeId: createdDashboardUsers[0].id,
        createdAt: new Date('2024-12-01T11:30:00Z')
      },
      {
        issueId: createdIssues[0].id,
        content: "Thank you for the quick response. I really need this resolved soon.",
        employeeId: createdEmployees[0].id,
        createdAt: new Date('2024-12-01T12:15:00Z')
      },
      {
        issueId: createdIssues[1].id,
        content: "Your leave application has been approved. Please check your email for the approval letter.",
        employeeId: createdDashboardUsers[3].id,
        createdAt: new Date('2024-12-02T16:45:00Z')
      },
      {
        issueId: createdIssues[2].id,
        content: "We are taking this matter very seriously. An investigation has been initiated.",
        employeeId: createdDashboardUsers[3].id,
        createdAt: new Date('2024-12-03T10:30:00Z')
      },
      {
        issueId: createdIssues[3].id,
        content: "Please try updating the app to the latest version. If the issue persists, we'll provide a temporary workaround.",
        employeeId: createdDashboardUsers[4].id,
        createdAt: new Date('2024-12-04T13:30:00Z')
      },
      {
        issueId: createdIssues[4].id,
        content: "Battery has been replaced. Please confirm if the bike is working properly now.",
        employeeId: createdDashboardUsers[1].id,
        createdAt: new Date('2024-11-30T17:00:00Z')
      },
      {
        issueId: createdIssues[4].id,
        content: "Yes, the bike is working perfectly now. Thank you for the quick resolution!",
        employeeId: createdEmployees[4].id,
        createdAt: new Date('2024-11-30T18:30:00Z')
      }
    ];

    // Create comments
    for (const commentData of comments) {
      const comment = await storage.createIssueComment(commentData);
      console.log(`Created comment for issue ${comment.issueId}`);
    }

    // Create ticket feedback
    const feedbackData = [
      {
        issueId: createdIssues[4].id,
        employeeId: createdEmployees[4].id,
        rating: 5,
        feedback: "Excellent service! The battery was replaced quickly and the staff was very helpful.",
        sentiment: "positive",
        createdAt: new Date('2024-11-30T19:00:00Z')
      },
      {
        issueId: createdIssues[6].id,
        employeeId: createdEmployees[6].id,
        rating: 4,
        feedback: "Good training session. Would like more practical demonstrations.",
        sentiment: "positive",
        createdAt: new Date('2024-11-27T19:00:00Z')
      },
      {
        issueId: createdIssues[7].id,
        employeeId: createdEmployees[7].id,
        rating: 3,
        feedback: "The policy explanation was helpful but could be clearer.",
        sentiment: "neutral",
        createdAt: new Date('2024-11-22T11:00:00Z')
      }
    ];

    // Create feedback
    for (const feedback of feedbackData) {
      const createdFeedback = await storage.createTicketFeedback(feedback);
      console.log(`Created feedback for issue ${createdFeedback.issueId}`);
    }

    console.log("✅ Comprehensive test data seeded successfully!");
    console.log(`Created ${createdDashboardUsers.length} dashboard users`);
    console.log(`Created ${createdEmployees.length} employees`);
    console.log(`Created ${createdIssues.length} issues`);
    console.log(`Created ${comments.length} comments`);
    console.log(`Created ${feedbackData.length} feedback entries`);

    return {
      dashboardUsers: createdDashboardUsers,
      employees: createdEmployees,
      issues: createdIssues,
      comments: comments.length,
      feedback: feedbackData.length
    };

  } catch (error) {
    console.error("Error seeding comprehensive data:", error);
    throw error;
  }
}