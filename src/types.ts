export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  schoolName: string;
  role: 'student' | 'teacher' | 'headmaster';
  qntTokens: number;
  level: number;
  badges: string[];
  status?: string;
  birthDate?: string;
  country?: string;
  language?: string;
  displayAge?: number;
  bio?: string;
  neuroSettings?: {
    dyslexicFont: boolean;
    contrastMode: 'glow-dark' | 'sepia' | 'high-contrast' | 'monochrome';
    letterSpacing: number; // in px
    lineHeight: number; // ratio
    cognitiveFatigueDetection: boolean;
    audioSynthesis: boolean;
    audioPauseDuration?: number; // seconds, e.g. 30
    letterInversionHighlight?: boolean;
    readingLineMask?: boolean;
    aiFontName?: string;
  };
}

export interface FeedPill {
  id: string;
  title: string;
  author: string;
  school: string;
  subject: string;
  videoUrl?: string;
  imageUrl?: string;
  summary: string;
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    tokenReward: number;
  };
  hitlVerified: boolean;
  hitlModerator: string;
  likes: number;
  shares: number;
  category: 'STEM' | 'AI' | 'Physics' | 'Humanities' | 'Economics';
}

export interface MarketplaceItem {
  id: string;
  title: string;
  author: string;
  authorUid: string;
  school: string;
  subject: string;
  priceQnt: number;
  rating: number;
  reviewsCount: number;
  description: string;
  type: 'notes' | 'mindmap' | 'summary' | 'cheat_sheet' | 'contrast_theme' | 'tutoring_slot';
  previewText: string;
  fileUrl?: string;
  driveFileUrl?: string;
  pdfDataUrl?: string;
  pdfFileName?: string;
  pdfFileSize?: string;
  purchasedAt?: string;
  verifiedByPeer: boolean;
}

export interface UserInvite {
  id: string;
  fromUid: string;
  fromName: string;
  fromEmail: string;
  toUid: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  senderUid: string;
  recipientUid: string;
  text: string;
  encryptedPayload: string;
  timestamp: string;
}

export interface QuantalyNotification {
  id: string;
  title: string;
  body: string;
  type: 'invite' | 'message' | 'call' | 'login' | 'reward' | 'calendar' | 'task';
  timestamp: string;
  read: boolean;
  icon?: string;
}

export interface AwardChallenge {
  id: string;
  title: string;
  category: string;
  description: string;
  problemStatement: string;
  prizeTokens: number;
  deadline: string;
  participantsCount: number;
  status: 'active' | 'evaluating' | 'completed';
}

export interface QuizItem {
  id: string;
  title: string;
  subject: string;
  author: string;
  questionsCount: number;
  tokenReward: number;
  hitlStatus: 'pending' | 'approved';
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
}
