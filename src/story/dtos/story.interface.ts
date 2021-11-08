export interface SearchParams {
  pageNo: number;
  pageSize: number;
  isPrivate: boolean;
}

export enum HistoryStatus {
  ISSUE = 'ISSUE',
  TRADE = 'TRADE',
}
