import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {

  const body = await req.json();
  const transactionId = crypto.randomUUID();

  // 🔐 variables reales (ENV)
  const merchantCode = process.env.IZIPAY_MERCHANT_CODE!;
  const privateKey = process.env.IZIPAY_PRIVATE_KEY!;
  const publicKey = process.env.IZIPAY_PUBLIC_KEY!;

  /**
   * Aquí normalmente:
   * 1. firmas payload
   * 2. llamas a API Izipay
   * 3. obtienes tokenSession + keyRSA
   *
   * (Simulado para ejemplo)
   */

  return NextResponse.json({
    merchantCode: process.env.IZIPAY_MERCHANT_CODE,
    transactionId,
    orderNumber: body.orderNumber,
    amount: body.amount,

    token: 'TOKEN_SESSION_GENERADO_POR_IZIPAY',
    keyRSA: 'PUBLIC_RSA_KEY'
  });
}
