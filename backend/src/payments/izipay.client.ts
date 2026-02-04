export const izipay = {
  async charge(payload: any) {
    return {
      status: 'PAID',
      transactionId: 'IZI_' + Date.now(),
      payload,
    };
  },
};
