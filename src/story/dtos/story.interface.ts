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
