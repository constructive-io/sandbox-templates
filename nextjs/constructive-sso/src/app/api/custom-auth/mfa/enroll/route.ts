import { NextResponse } from 'next/server';

import { readChallengeCookie } from '@/lib/bff/challenge-cookie';
import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';
import { GatewayError, gatewayPost } from '@/lib/sso/gateway';

interface EnrollBody {
  questions?: Array<{ question: string; answer: string }>;
}

/**
 * POST /api/custom-auth/mfa/enroll — set the security questions during a live
 * challenge. The account that must enroll has no session yet; the challenge
 * token (which only a correct password earned) is the only key accepted.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const csrf = sameOriginGuard(req);
  if (csrf) return csrf;

  const body = await readJsonBody<EnrollBody>(req);
  const questions = body?.questions;
  if (
    !Array.isArray(questions) ||
    questions.length !== 3 ||
    questions.some((q) => !q.question?.trim() || !q.answer?.trim())
  ) {
    return NextResponse.json({ error: 'SECURITY_QUESTIONS_INVALID' }, { status: 400 });
  }
  const challenge = readChallengeCookie(req.headers.get('cookie'));
  if (!challenge) {
    return NextResponse.json({ error: 'MFA_CHALLENGE_MISSING' }, { status: 400 });
  }

  try {
    const result = await gatewayPost<{ enrolled: boolean }>(
      '/auth/enroll-security-questions',
      {
        user_id: challenge.userId,
        mfa_challenge_token: challenge.mfaChallengeToken,
        questions: questions.map((q) => ({ question: q.question.trim(), answer: q.answer }))
      },
      null
    );
    return NextResponse.json({ enrolled: result.enrolled === true });
  } catch (err) {
    if (err instanceof GatewayError) {
      return NextResponse.json({ error: err.code }, { status: err.status === 400 ? 400 : 502 });
    }
    throw err;
  }
}
