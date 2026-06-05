import type { VerifiableField, VerificationStatusValue } from '@/types/project'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface VerificationRequest {
  projectId: string
  field: VerifiableField
  /** Attachment filenames or identity reference numbers submitted as evidence */
  evidence: string[]
}

export interface VerificationResult {
  field: VerifiableField
  status: VerificationStatusValue
  message: string
  verifiedAt?: string
}

export interface VerificationService {
  /**
   * Submit a verification request.
   * Real implementation: POST to backend, which queues for human review or
   * runs automated checks (patent registry lookup, tax bureau API, etc.).
   * Returns 'pending' immediately for async review, or 'verified' if instant check passes.
   */
  requestVerification(req: VerificationRequest): Promise<VerificationResult>
}

// ── Field labels (for UI display) ─────────────────────────────────────────────

export const VERIFIABLE_FIELD_LABELS: Record<VerifiableField, string> = {
  teamMembers:   '团队成员（身份证资料）',
  patents:       '代表性专利（证书附件）',
  totalFunding:  '累计融资额（融资协议）',
  rdExpenditure: '年研发投入（财务审计报告）',
  totalRevenue:  '年营业收入（财务审计报告）',
}

// ── Mock service (simulates async platform review) ────────────────────────────

function createMockVerificationService(): VerificationService {
  return {
    async requestVerification(req: VerificationRequest): Promise<VerificationResult> {
      // Simulate network round-trip
      await new Promise((r) => setTimeout(r, 1200))
      return {
        field: req.field,
        status: 'verified',
        message: '验证通过（平台人工审核，模拟）',
        verifiedAt: new Date().toISOString(),
      }
    },
  }
}

// TODO §3.4 真实验证接口对接
// 需求：对接后端 /api/verification/request，后端转发至：
//   - teamMembers: 公安部身份证核验 API
//   - patents: 国家知识产权局专利数据库
//   - totalFunding / rdExpenditure / totalRevenue: 人工审核（上传附件）
// 现状：mock 直接返回 'verified'，无需附件或网络。
// 待做：替换 createMockVerificationService 为 createRealVerificationService(config)。

export const verificationService: VerificationService = createMockVerificationService()
