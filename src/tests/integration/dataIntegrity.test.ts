import { describe, it, expect, beforeEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { products, soldOutProducts, getProductBySlug, getFeaturedProducts, getLimitedProducts } from '../../data/products'
import {
  COUPON_INFO,
  COUPONS,
  getCouponDiscount,
  getCouponInfo,
  FREE_SHIPPING_THRESHOLD,
  formatCurrency,
  formatCEP,
  estimateShipping,
} from '../../utils/commerce'
import { createGiftCard, getGiftCardByCode, getGiftCards, setGiftCardUsed, GIFT_CARD_AMOUNTS } from '../../utils/gifts'
import type { Product } from '../../types'

const PUBLIC_DIR = path.resolve(process.cwd(), 'public')

function resolvePublic(url: string): string {
  return path.join(PUBLIC_DIR, url.replace(/^\//, ''))
}

function listImagePaths(product: Product): string[] {
  const out: string[] = [...product.images]
  if (product.colorImages) {
    Object.values(product.colorImages).forEach((arr) => out.push(...arr))
  }
  if (product.lifestyleImages) {
    out.push(...product.lifestyleImages.map((l) => l.src))
  }
  return out
}

describe('Integridade dos Dados de Produtos', () => {
  const all = [...products, ...soldOutProducts]

  it('possui produtos suficientes para o catálogo', () => {
    expect(products.length).toBeGreaterThanOrEqual(8)
    expect(all.length).toBeGreaterThan(products.length)
  })

  it('ids e slugs são únicos em todo o catálogo', () => {
    const ids = all.map((p) => p.id)
    const slugs = all.map((p) => p.slug)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('todos os produtos possuem campos essenciais válidos', () => {
    for (const p of all) {
      expect(p.id, `produto ${p.name}`).toBeTruthy()
      expect(p.name, `id ${p.id}`).toBeTruthy()
      expect(p.slug, `id ${p.id}`).toMatch(/^[a-z0-9-]+$/)
      expect(p.price, `preço de ${p.name}`).toBeGreaterThan(0)
      expect(p.description, `descrição de ${p.name}`).toBeTruthy()
      expect(p.shortDescription, `shortDescription de ${p.name}`).toBeTruthy()
      expect(p.images.length, `imagens de ${p.name}`).toBeGreaterThan(0)
      expect(p.sizes.length, `tamanhos de ${p.name}`).toBeGreaterThan(0)
      expect(p.colors.length, `cores de ${p.name}`).toBeGreaterThan(0)
      expect(p.edition.current, `edição current de ${p.name}`).toBeGreaterThan(0)
      expect(p.edition.total, `edição total de ${p.name}`).toBeGreaterThan(0)
    }
  })

  it('edição nunca excede o total e o estoque é coerente', () => {
    for (const p of all) {
      expect(p.edition.current).toBeLessThanOrEqual(p.edition.total)
      if (p.edition.isLimited && p.edition.current >= p.edition.total) {
        expect(p.stock, `produto esgotado por edição ${p.name}`).toBe(0)
      }
      if (p.stock === 0) {
        expect(p.edition.current, `estoque 0 mas edição aberta ${p.name}`).toBeGreaterThanOrEqual(p.edition.total)
      }
    }
  })

  it('produtos limitados possuem data de fim de venda válida', () => {
    for (const p of all) {
      if (p.edition.isLimited) {
        expect(p.saleEndsAt, `saleEndsAt de ${p.name}`).toBeTruthy()
        expect(isNaN(Date.parse(p.saleEndsAt!))).toBe(false)
      }
    }
  })

  it('originalPrice, quando presente, é maior que o preço promocional', () => {
    for (const p of all) {
      if (p.originalPrice != null) {
        expect(p.originalPrice).toBeGreaterThan(p.price)
      }
    }
  })

  it('cores declaradas e colorImages são consistentes entre si', () => {
    for (const p of products) {
      const colorNames = p.colors.map((c) => c.name)
      expect(new Set(colorNames).size, `cores duplicadas em ${p.name}`).toBe(colorNames.length)
      if (p.colorImages) {
        const keys = Object.keys(p.colorImages)
        expect(keys.sort(), `colorImages de ${p.name}`).toEqual(colorNames.slice().sort())
      }
    }
  })

  it('toda imagem referenciada existe em public/ (protege contra 404s no Pages)', () => {
    const missing: string[] = []
    for (const p of all) {
      for (const img of listImagePaths(p)) {
        if (!fs.existsSync(resolvePublic(img))) missing.push(`${p.name}: ${img}`)
      }
    }
    expect(missing).toEqual([])
  })

  it('slugs resolvem corretamente via getProductBySlug', () => {
    for (const p of products) {
      expect(getProductBySlug(p.slug)?.id).toBe(p.id)
    }
  })

  it('helpers de filtro retornam apenas produtos que atendem ao critério', () => {
    for (const p of getFeaturedProducts()) expect(p.isFeatured).toBe(true)
    for (const p of getLimitedProducts()) expect(p.edition.isLimited).toBe(true)
  })

  it('produtos esgotados estão realmente esgotados', () => {
    for (const p of soldOutProducts) {
      expect(p.stock).toBe(0)
      expect(p.edition.current).toBe(p.edition.total)
    }
  })
})

describe('Integridade dos Cupons', () => {
  it('códigos de cupom são únicos e mapeiam corretamente para o desconto', () => {
    const codes = Object.keys(COUPON_INFO)
    expect(new Set(codes).size).toBe(codes.length)

    for (const code of codes) {
      expect(COUPONS[code]).toBeDefined()
      expect(COUPON_INFO[code].discount).toBe(COUPONS[code])
      expect(COUPON_INFO[code].discount).toBeGreaterThan(0)
      expect(COUPON_INFO[code].discount).toBeLessThan(1)
      expect(COUPON_INFO[code].title).toBeTruthy()
      expect(COUPON_INFO[code].description).toBeTruthy()
      expect(COUPON_INFO[code].rules.length).toBeGreaterThan(0)
    }
  })

  it('getCouponDiscount normaliza a entrada em caixa alta', () => {
    expect(getCouponDiscount(' cosmico15 ')).toBe(0.15)
    expect(getCouponDiscount('inexistente')).toBeNull()
  })

  it('getCouponInfo retorna null para cupons desconhecidos', () => {
    expect(getCouponInfo('XYZ')).toBeNull()
  })

  it('estimativa de frete e formatação mantêm coerência', () => {
    expect(FREE_SHIPPING_THRESHOLD).toBeGreaterThan(0)
    expect(estimateShipping('01310-100').price).toBe(19.9)
    expect(formatCurrency(19.9)).toBe('R$ 19,90')
    expect(formatCEP('01310100')).toBe('01310-100')
  })
})

describe('Integridade dos Gift Cards', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('valores de gift card disponíveis são positivos e únicos', () => {
    expect(new Set(GIFT_CARD_AMOUNTS).size).toBe(GIFT_CARD_AMOUNTS.length)
    for (const amount of GIFT_CARD_AMOUNTS) expect(amount).toBeGreaterThan(0)
  })

  it('cria gift card com código no formato KR-XXXXXX e persiste', () => {
    const card = createGiftCard({ amount: 100, fromName: 'Ana', toEmail: 'ana@test.com', message: 'Feliz aniversário!' })

    expect(card.code).toMatch(/^KR-[A-Z0-9]{6}$/)
    expect(card.used).toBe(false)
    expect(getGiftCardByCode(card.code)).toBeDefined()
    expect(getGiftCards().length).toBe(1)
  })

  it('marca gift card como usado', () => {
    const card = createGiftCard({ amount: 50, fromName: 'João', toEmail: 'joao@test.com', message: 'Presente!' })

    setGiftCardUsed(card.code, true)
    expect(getGiftCardByCode(card.code)?.used).toBe(true)
  })

  it('rejeita código inexistente', () => {
    expect(getGiftCardByCode('KR-ABC123')).toBeUndefined()
  })
})
