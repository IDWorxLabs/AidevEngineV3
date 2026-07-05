export type PreviewVerificationStatus = 'PASS' | 'WARN' | 'FAIL';

export interface PreviewVerificationReport {
  previewStarted: boolean;
  previewUrl: string | null;
  httpReachable: boolean;
  httpStatus: number | null;
  htmlLoaded: boolean;
  applicationRendered: boolean;
  previewStartupMs: number;
  verificationDurationMs: number;
  evidence: string[];
  warnings: string[];
  status: PreviewVerificationStatus;
}
