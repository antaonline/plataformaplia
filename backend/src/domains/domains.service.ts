import { BadRequestException, Injectable } from '@nestjs/common'
import axios from 'axios'

type DomainResult = {
  domain: string
  available: boolean
  price: number
  currency: string
}

@Injectable()
export class DomainsService {
  private baseUrl =
    process.env.NAMECHEAP_API_BASE ??
    'https://api.sandbox.namecheap.com/xml.response'

  private apiUser = process.env.NAMECHEAP_API_USER
  private apiKey = process.env.NAMECHEAP_API_KEY
  private username = process.env.NAMECHEAP_USERNAME
  private clientIp = process.env.NAMECHEAP_CLIENT_IP ?? '127.0.0.1'

  private markupPercent = Number(process.env.DOMAIN_MARKUP_PERCENT ?? '0')
  private markupFlat = Number(process.env.DOMAIN_MARKUP_FLAT ?? '0')

  private tlds =
    (process.env.NAMECHEAP_TLDS ?? 'com,net,org,pe,com.pe')
      .split(',')
      .map((tld) => tld.trim())
      .filter(Boolean)

  async checkDomains(rawQuery: string) {
    const query = (rawQuery ?? '').trim().toLowerCase()
    if (!query) {
      throw new BadRequestException('Dominio invalido')
    }

    const domainList = this.buildDomainList(query)
    const xml = await this.requestCheck(domainList)
    const results = this.parseResults(xml)

    return {
      query,
      results,
    }
  }

  async checkSingleDomain(domain: string) {
    const domainList = [domain]
    const xml = await this.requestCheck(domainList)
    const results = this.parseResults(xml)
    return results.find((r) => r.domain === domain)
  }

  private buildDomainList(query: string) {
    if (query.includes('.')) {
      return [query]
    }
    return this.tlds.map((tld) => `${query}.${tld}`)
  }

  private async requestCheck(domainList: string[]) {
    if (!this.apiUser || !this.apiKey || !this.username) {
      throw new BadRequestException('Namecheap no configurado')
    }

    const params = {
      ApiUser: this.apiUser,
      ApiKey: this.apiKey,
      UserName: this.username,
      ClientIp: this.clientIp,
      Command: 'namecheap.domains.check',
      DomainList: domainList.join(','),
    }

    const response = await axios.get(this.baseUrl, { params })
    return response.data as string
  }

  private parseResults(xml: string): DomainResult[] {
    const results: DomainResult[] = []
    const matches = xml.matchAll(/<DomainCheckResult\s+([^>]+)\/>/g)

    for (const match of matches) {
      const attrs = match[1]
      const data: Record<string, string> = {}
      for (const attr of attrs.matchAll(/(\w+)=\"([^\"]*)\"/g)) {
        data[attr[1]] = attr[2]
      }

      const domain = data.Domain ?? ''
      const available = (data.Available ?? 'false') === 'true'
      const currency = data.Currency ?? 'USD'

      const basePriceRaw =
        data.PremiumRegistrationPrice ||
        data.RegistrationPrice ||
        data.RegularPrice ||
        '0'
      const basePrice = Number(basePriceRaw)

      const priceWithMarkup = this.applyMarkup(basePrice)

      results.push({
        domain,
        available,
        price: priceWithMarkup,
        currency,
      })
    }

    return results
  }

  private applyMarkup(basePrice: number) {
    const percent = this.markupPercent
    const flat = this.markupFlat
    const total = basePrice * (1 + percent / 100) + flat
    return Math.round(total * 100) / 100
  }
}
