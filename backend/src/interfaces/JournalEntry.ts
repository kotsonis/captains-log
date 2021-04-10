export interface JournalEntry {
    entryId: string
    entryDate: string
    headline: string
    description?: string
    mood?: number
    attachmentUrl?: string
  }