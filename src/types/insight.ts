export interface MemberStats {
  active: number;
  retention: number;
  new_members: number;
  total: number;
}

export interface MemberActivity {
  month: string;
  value: number;
}

export interface Insight {
  title: string;
  text: string;
  recommendation?: string;
  borderColor?: string;
}

export interface Member {
  id: string;
  name: string;
  joinDate: string;
  status: string;
}

export interface ChartSegment {
  name: string;
  value: number;
  color: string;
  members: Member[];
}

export interface ChartWorkout {
  time: string;
  members: number;
}

export interface ChartFunnel {
  name: string;
  value: number;
  fill: string;
}

export interface ChartNotifResponse {
  type: string;
  responded: number;
  ignored: number;
}

export interface ChartABTesting {
  feature: string;
  success: number;
  total: number;
}
