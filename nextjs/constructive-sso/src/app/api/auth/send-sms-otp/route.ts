import { NextResponse } from 'next/server';

import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';
import { GatewayError, gatewayPost } from '@/lib/sso/gateway';

interface SendSmsOtpBody {
	phone?: string;
}

/** E.164 (the lane rejects anything else, but refuse it here first). */
const E164 = /^\+[1-9]\d{7,14}$/;

/**
 * POST /api/auth/send-sms-otp — relay the phone number to the gateway's
 * anonymous `auth_flows:send_sms_otp` lane, which enqueues the platform's sms
 * cloud function against THIS tenant (the function reads its provider
 * settings from the tenant's own database-scope store — see
 * packages/provision/src/configure-sms.ts).
 *
 * The body must be JSON with `content-type: application/json` — the lane
 * rejects form-encoded bodies with `400 request body must be valid JSON`;
 * gatewayPost always sends JSON. No session needed: the lane is anonymous
 * and rate-limited per IP by the platform.
 */
export async function POST(req: Request): Promise<NextResponse> {
	const csrf = sameOriginGuard(req);
	if (csrf) return csrf;

	const body = await readJsonBody<SendSmsOtpBody>(req);
	if (!body) {
		return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
	}
	const phone = body.phone?.trim();
	if (!phone || !E164.test(phone)) {
		return NextResponse.json({ error: 'phone must be in E.164 format (+country number)' }, { status: 400 });
	}

	try {
		await gatewayPost<{ sent: boolean }>('/auth/send-sms-otp', { phone }, null);
		return NextResponse.json({ sent: true });
	} catch (err) {
		if (err instanceof GatewayError) {
			return NextResponse.json({ error: err.code }, { status: err.status === 400 ? 400 : 502 });
		}
		throw err;
	}
}
