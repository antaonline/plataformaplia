import axios from 'axios';
import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IzipayService {
  private baseUrl =
    process.env.IZIPAY_ENV === 'production'
      ? 'https://api.izipay.pe'
      : 'https://api-sandbox.izipay.pe';

  private merchantId = process.env.IZIPAY_MERCHANT_ID!;
  private privateKey = process.env.IZIPAY_PRIVATE_KEY!;

  async chargeTokenized(data: {
    amount: number;
    cardToken: string;
    currency?: string;
    orderId: number;
  }) {
    const payload = {
      merchantId: this.merchantId,
      amount: data.amount,
      currency: data.currency ?? 'PEN',
      cardToken: data.cardToken,
      orderId: data.orderId.toString(),
    };

    const signature = this.signPayload(payload);

    const response = await axios.post(
      `${this.baseUrl}/v2/charge`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${signature}`,
        },
      },
    );

    return response.data;
  }

  async createSession(data: {
    amount: number;
    orderNumber: string;
    transactionId?: string;
  }) {
    const payload = {
      merchantCode: this.merchantId,
      orderNumber: data.orderNumber,
      amount: data.amount.toFixed(2),
      currency: 'PEN',
      transactionId: data.transactionId,
    };

    const response = await axios.post(
      `${this.baseUrl}/checkout/session`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  }


  validateResponse(payload: any, receivedHash: string): boolean {
    const raw = Object.values(payload).join('');
    const expectedHash = crypto
      .createHmac('sha256', this.privateKey)
      .update(raw)
      .digest('hex');

    return expectedHash === receivedHash;
  }


  private signPayload(payload: any): string {
    const raw = Object.values(payload).join('');
    return crypto
      .createHmac('sha256', this.privateKey)
      .update(raw)
      .digest('hex');
  }
}
