
export type BehaviorTag = 'Visibly Confused' | 'Verbal Outburst' | 'Distracting Others';

export interface BehaviorEvent {
  id: string;
  tag: BehaviorTag;
  timestamp: string;
  studentId: string;
}
