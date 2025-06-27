export interface User {
  id: number;
  role: "citizen" | "advocate" | "judge" | "clerk";
  cnicOrBarIdOrJudgeCode: string;
  name: string;
  phone?: string;
  username?: string;
  createdAt?: string;
}

export interface Case {
  id: number;
  title: string;
  type: string;
  status: "filed" | "pending" | "in-hearing" | "decided";
  filedBy: number;
  assignedJudge?: number;
  nextHearing?: string;
  createdAt?: string;
  summary?: string;
  court?: string;
}

export interface Evidence {
  id: number;
  caseId: number;
  filename: string;
  hash: string;
  uploadedBy: number;
  evidenceType: string;
  verified: boolean;
  createdAt?: string;
}

export interface Hearing {
  id: number;
  caseId: number;
  dateTime: string;
  location?: string;
  videoUrl?: string;
  remarks?: string;
  createdAt?: string;
}

export interface AIBrief {
  summary: string;
  keyPoints: string[];
  precedents: string[];
  recommendations: string[];
}
