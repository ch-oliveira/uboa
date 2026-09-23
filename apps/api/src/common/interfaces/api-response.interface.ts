export interface ApiResponse<T, M = any> {
  success: boolean;
  data: T;
  meta?: M;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}
