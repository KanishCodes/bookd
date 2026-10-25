export const MOCK_REPORTS = {
  summary: {
    totalBooks: 32,
    totalCopies: 138,
    activeLoans: 8,
    overdueLoans: 4,
    totalMembers: 16,
    totalFinesCollected: 1420,
    pendingFines: 265
  },
  mostIssuedBooks: [
    { title: "Introduction to Algorithms", issues: 48, category: "Computer Science" },
    { title: "Designing Data-Intensive Apps", issues: 42, category: "Computer Science" },
    { title: "Sapiens: A Brief History", issues: 37, category: "History & Philosophy" },
    { title: "To Kill a Mockingbird", issues: 35, category: "Classic Literature" },
    { title: "Dune", issues: 31, category: "Fiction & Mystery" },
    { title: "The Pragmatic Programmer", issues: 29, category: "Computer Science" },
    { title: "The Gene: An Intimate History", issues: 24, category: "Science & Nature" },
    { title: "Ways of Seeing", issues: 22, category: "Art & Architecture" }
  ],
  monthlyCirculation: [
    { month: "May", issues: 78, returns: 72 },
    { month: "Jun", issues: 64, returns: 68 },
    { month: "Jul", issues: 92, returns: 84 },
    { month: "Aug", issues: 114, returns: 105 },
    { month: "Sep", issues: 138, returns: 126 },
    { month: "Oct", issues: 154, returns: 139 }
  ],
  categoryDistribution: [
    { name: "Computer Science", count: 7, loans: 162 },
    { name: "Classic Literature", count: 5, loans: 118 },
    { name: "History & Philosophy", count: 5, loans: 98 },
    { name: "Science & Nature", count: 5, loans: 84 },
    { name: "Art & Architecture", count: 4, loans: 62 },
    { name: "Fiction & Mystery", count: 4, loans: 94 },
    { name: "Poetry", count: 3, loans: 32 }
  ],
  overdueMembers: [
    { name: "Sneha Mukherjee", memberId: "MEM-2024-190", book: "A Pattern Language", overdueDays: 24, fine: 120 },
    { name: "Aanya Verma", memberId: "MEM-2024-042", book: "One Hundred Years of Solitude", overdueDays: 10, fine: 50 },
    { name: "Karan Johar", memberId: "MEM-2024-288", book: "A Brief History of Time", overdueDays: 9, fine: 45 },
    { name: "Kanish", memberId: "MEM-2024-001", book: "Structure and Interpretation of Computer Programs", overdueDays: 7, fine: 35 },
    { name: "Divya Nambiar", memberId: "MEM-2024-380", book: "Ways of Seeing", overdueDays: 3, fine: 15 }
  ]
};
