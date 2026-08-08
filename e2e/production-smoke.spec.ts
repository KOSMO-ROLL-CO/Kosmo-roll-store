import { test, expect } from '@playwright/test'

const BASE_PATH = process.env.SMOKE_BASE_PATH ?? '/Kosmo-roll-store'

test.describe('Smoke Test do Build de Produção (GitHub Pages)', () => {
  const failedRequests: string[] = []

  test.beforeEach(async ({ page }) => {
    failedRequests.length = 0
    page.on('response', (response) => {
      const url = response.url()
      const status = response.status()
      if (status >= 400 && url.startsWith('http://localhost:4174')) {
        failedRequests.push(`${status} -> ${url}`)
      }
    })
  })

  test('rotas principais carregam sem nenhum recurso com erro HTTP', async ({ page }) => {
    for (const route of ['/', '/catalogo', '/sobre', '/produto/alien-joia-tee']) {
      await page.goto(`${BASE_PATH}${route}`)
      await page.waitForLoadState('networkidle')
    }

    expect(failedRequests, `Recursos com erro HTTP: ${failedRequests.join(', ')}`).toEqual([])
  })

  test('logo carrega com dimensões reais', async ({ page }) => {
    await page.goto(`${BASE_PATH}/`)
    await page.waitForLoadState('networkidle')

    const logo = page.locator('img[alt="Kosmo Roll"]').first()
    await expect(logo).toBeVisible()

    const naturalWidth = await logo.evaluate((img: HTMLImageElement) => img.naturalWidth)
    expect(naturalWidth, 'Logo com naturalWidth = 0 (não carregou)').toBeGreaterThan(0)
  })

  test('imagem de produto é servida no caminho com base path', async ({ request }) => {
    const res = await request.get(`${BASE_PATH}/products/alien-joia-front.webp`)
    expect(res.status()).toBe(200)
  })

  test('vídeo do hero é servido no caminho com base path', async ({ request }) => {
    const res = await request.get(`${BASE_PATH}/videos/hero-bg.mp4`)
    expect(res.status()).toBe(200)
  })

  test('favicon é servido no caminho com base path', async ({ request }) => {
    const res = await request.get(`${BASE_PATH}/favicon-32x32.png`)
    expect(res.status()).toBe(200)
  })
})
