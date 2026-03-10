import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { PaymentsService } from './payments.service';

@Controller()
export class IzipayReturnController {
  constructor(private paymentsService: PaymentsService) {}

  @All('izipay/return')
  async handleReturn(@Req() req: Request, @Res() res: Response) {
    const webUrl =
      process.env.WEB_URL ??
      process.env.FRONTEND_URL ??
      'http://localhost:3001';

    const body = (req.body ?? {}) as any;
    const query = (req.query ?? {}) as any;

    const krAnswer =
      body['kr-answer'] ??
      body['kr_answer'] ??
      query['kr-answer'] ??
      query['kr_answer'] ??
      body['krAnswer'] ??
      query['krAnswer'] ??
      body['krAnswer'] ??
      query['krAnswer'];

    const krHash =
      body['kr-hash'] ??
      body['kr_hash'] ??
      query['kr-hash'] ??
      query['kr_hash'] ??
      body['krHash'] ??
      query['krHash'];

    const payload = {
      'kr-answer': krAnswer,
      'kr-hash': krHash,
    };

    try {
      const result = await this.paymentsService.confirmIzipayPayment(payload);
      const token =
        (result as any)?.passwordSetupToken ??
        (result as any)?.setupToken ??
        null;
      const tokenParam = token ? `&token=${encodeURIComponent(token)}` : '';
      return res.redirect(`${webUrl}/set-password?status=success${tokenParam}`);
    } catch (err: any) {
      const reason = encodeURIComponent(err?.message ?? 'payment_failed');
      return res.redirect(`${webUrl}/set-password?status=failed&reason=${reason}`);
    }
  }
}
