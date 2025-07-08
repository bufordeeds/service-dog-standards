// API Response Types
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  relationship: string;
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canManage: boolean;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string | null;
  type: string;
  achievedAt: string | Date;
  issuer: string | null;
  certificateNumber?: string | null;
}

export interface Dog {
  id: string;
  registrationNum: string;
  name: string;
  breed?: string | null;
  status: "ACTIVE" | "IN_TRAINING" | "RETIRED" | "WASHED_OUT" | "IN_MEMORIAM";
  profileImage?: string | null;
  bio?: string | null;
  teamMembers: TeamMember[];
  recentAchievements: Achievement[];
  trainingEndDate?: string | Date | null;
  trainingStartDate?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  // Additional fields that might be returned from API
  ownerId?: string;
  organizationId?: string;
  weight?: number | null;
  color?: string | null;
  gender?: string | null;
  birthDate?: string | Date | null;
  publicProfile?: boolean;
  showInDirectory?: boolean;
}

export interface QuickAction {
  title: string;
  href: string;
  icon: string;
}

export interface DashboardStats {
  totalUsers?: number;
  totalDogs?: number;
  pendingReviews?: number;
  revenue?: number;
  activeClients?: number;
  dogsInTraining?: number;
  sessionsThisMonth?: number;
  monthlyIncome?: number;
  activeDogs?: number;
  trainingProgress?: number;
  teamMembers?: number;
  userGrowth?: string;
  dogGrowth?: string;
  pendingGrowth?: string;
  revenueGrowth?: string;
  clientGrowth?: string;
  trainingGrowth?: string;
  sessionGrowth?: string;
  incomeGrowth?: string;
  progressGrowth?: string;
  teamGrowth?: string;
}

export interface ActivityItem {
  id: string;
  type: "registration" | "training" | "agreement";
  title: string;
  description: string;
  status: string;
  time: string;
}

export interface DashboardData {
  stats: DashboardStats;
  quickActions: QuickAction[];
  recentActivity: ActivityItem[];
}