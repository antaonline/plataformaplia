import axios from 'axios';
import * as crypto from 'crypto';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class IzipayService {
  private baseUrl = process.env.IZIPAY_BASE_URL ?? 'https://api.micuentaweb.pe';
  private shopId = process.env.IZIPAY_SHOP_ID ?? '';
  private password = process.env.IZIPAY_PRIVATE_KEY ?? '';
  private publicKey = process.env.IZIPAY_PUBLIC_KEY ?? '';
  private hashKey = process.env.IZIPAY_HASH_KEY ?? '';

  private assertConfig() {
    if (!this.shopId) {
      throw new BadRequestException('Falta IZIPAY_SHOP_ID');
    }
    if (!this.password) {
      throw new BadRequestException('Falta IZIPAY_PRIVATE_KEY');
    }
    if (!this.publicKey) {
      throw new BadRequestException('Falta IZIPAY_PUBLIC_KEY');
    }
  }

  async chargeTokenized(data: {
    amount: number;
    cardToken: string;
    currency?: string;
    orderId: number;
  }) {
    this.assertConfig();
    const payload = {
      amount: Math.round(data.amount * 100),
      currency: data.currency ?? 'PEN',
      paymentMethodToken: data.cardToken,
      orderId: data.orderId.toString(),
    };

    const response = await axios.post(
      `${this.baseUrl}/api-payment/V4/Charge/CreatePayment`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.basicAuth(),
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
    this.assertConfig();
    const payload = {
      amount: Math.round(data.amount * 100),
      currency: 'PEN',
      orderId: data.orderNumber,
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/api-payment/V4/Charge/CreatePayment`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.basicAuth(),
          },
        },
      );

      return response.data;
    } catch (error: any) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.error('Izipay createSession error', {
        status,
        data,
        message: error?.message,
      });
      throw new BadRequestException(
        data?.message ??
          data?.error ??
          'Error al crear sesion en Izipay',
      );
    }
  }


  validateResponse(payload: any, receivedHash: string): boolean {
    if (!this.hashKey || !receivedHash) return false;
    const raw =
      typeof payload === 'string' ? payload : JSON.stringify(payload);
    const expectedHash = crypto
      .createHmac('sha256', this.hashKey)
      .update(raw)
      .digest('hex');

    return expectedHash === receivedHash;
  }


  private signPayload(payload: any): string {
    const raw = Object.values(payload).join('');
    return crypto
      .createHmac('sha256', this.hashKey)
      .update(raw)
      .digest('hex');
  }

  private basicAuth(): string {
    const token = Buffer.from(`${this.shopId}:${this.password}`).toString(
      'base64',
    );
    return `Basic ${token}`;
  }
}
