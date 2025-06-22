export interface PdfGenerationStartedEvent {
  job_id: string
  filename: string
  report_type: string
  status: 'started'
  timestamp: string
  message: string
}

export interface PdfGenerationProgressEvent {
  job_id: string
  progress: number
  current_step: string
  status: 'processing'
  timestamp: string
}

export interface PdfGenerationCompletedEvent {
  job_id: string
  filename: string
  download_url: string
  file_size: number
  file_size_formatted: string
  status: 'completed'
  timestamp: string
  message: string
}

export interface PdfGenerationFailedEvent {
  job_id: string
  error_message: string
  retry_count: number
  can_retry: boolean
  status: 'failed'
  timestamp: string
  message: string
}

export type PdfEvent = 
  | PdfGenerationStartedEvent 
  | PdfGenerationProgressEvent 
  | PdfGenerationCompletedEvent 
  | PdfGenerationFailedEvent

export interface PdfJobState {
  jobId: string | null
  status: 'idle' | 'started' | 'processing' | 'completed' | 'failed'
  progress: number
  currentStep: string
  filename: string | null
  downloadUrl: string | null
  errorMessage: string | null
  canRetry: boolean
  fileSize: number | null
  fileSizeFormatted: string | null
}
