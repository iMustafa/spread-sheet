export enum SheetStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export interface SheetUpdateStatus {
  id?: string
  done_at?: string
  status: SheetStatus
}
