import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { server } from '../mocks/server'
import { estimateShipping } from '../../utils/commerce'

describe('Resiliência de Rede & Erros de API (MSW)', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('calcula frete offline localmente mesmo sem resposta de API remota', () => {
    const shipping = estimateShipping('01310100')
    expect(shipping.price).toBe(19.9)
    expect(shipping.days).toBe(2)
  })

  it('lida graciosamente com CEPs malformados ou incompletos', () => {
    const invalid = estimateShipping('000')
    expect(invalid.price).toBe(0)
    expect(invalid.days).toBe(0)
  })
})
