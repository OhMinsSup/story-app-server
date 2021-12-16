export interface SearchParams {
  pageNo: number;
  pageSize: number;
  isPrivate: boolean;
  userId?: number;
}

export enum HistoryStatus {
  ISSUE = 'ISSUE',
  TRADE = 'TRADE',
}

export interface StorySearchParams
  extends Omit<SearchParams, 'userId' | 'isPrivate'> {
  backgrounds?: string[] | string;
  tags?: string[] | string;
}
