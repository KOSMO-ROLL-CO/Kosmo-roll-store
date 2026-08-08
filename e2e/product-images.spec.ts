import { test, expect } from '@playwright/test'

test.describe('Carregamento de Imagens de Produtos no Navegador (E2E)', () => {
  test('imagens dos produtos carregam sem erro 404 na página de catálogo', async ({ page }) => {
    const failedImages: string[] = []

    page.on('response', (response) => {
      const url = response.url()
      if (url.includes('/products/') && url.endsWith('.webp') && response.status() >= 400) {
        failedImages.push(`HTTP ${response.status()} -> ${url}`)
      }
    })

    await page.goto('/catalogo')
    await page.waitForLoadState('networkidle')

    // Força o carregamento das imagens lazy (abaixo da dobra) rolando a página
    await page.evaluate(async () => {
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
      for (let y = 0; y <= document.body.scrollHeight; y += window.innerHeight) {
        window.scrollTo(0, y)
        await delay(100)
      }
      window.scrollTo(0, 0)
    })

    // Aguarda todas as imagens do catálogo terminarem de carregar
    await page.waitForFunction(() => {
      const imgs = document.querySelectorAll<HTMLImageElement>('img[src*="/products/"]')
      return Array.from(imgs).every((img) => img.complete)
    }, { timeout: 15000 })

    expect(failedImages, `Imagens com 404: ${failedImages.join(', ')}`).toEqual([])
  })

  test('nenhuma imagem de produto renderiza o placeholder de erro (broken image fallback)', async ({ page }) => {
    await page.goto('/catalogo')
    await page.waitForLoadState('networkidle')

    // Detectar <img> cujo naturalWidth === 0 (imagem não carregada / quebrada)
    const brokenImages = await page.evaluate(() => {
      const imgs = document.querySelectorAll<HTMLImageElement>('img[src*="/products/"]')
      return Array.from(imgs)
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.getAttribute('src') ?? '(sem src)')
    })

    expect(brokenImages, `Imagens quebradas no catálogo: ${brokenImages.join(', ')}`).toEqual([])
  })

  test('imagens do primeiro produto carregam corretamente na página de detalhe', async ({ page }) => {
    const failedImages: string[] = []

    page.on('response', (response) => {
      const url = response.url()
      if (url.includes('/products/') && response.status() >= 400) {
        failedImages.push(`HTTP ${response.status()} -> ${url}`)
      }
    })

    await page.goto('/produto/alien-joia-tee')
    await page.waitForLoadState('networkidle')

    // Verificar que a imagem principal carregou com sucesso
    const mainImage = page.locator('img[src*="/products/alien-joia"]').first()
    await expect(mainImage).toBeVisible({ timeout: 8000 })

    const naturalWidth = await mainImage.evaluate((img: HTMLImageElement) => img.naturalWidth)
    expect(naturalWidth, 'Imagem do produto tem naturalWidth = 0 (imagem quebrada)').toBeGreaterThan(0)

    expect(failedImages).toEqual([])
  })

  test('página de produtos esgotados exibe imagens sem erro', async ({ page }) => {
    const failedImages: string[] = []

    page.on('response', (response) => {
      const url = response.url()
      if (url.includes('/products/') && response.status() >= 400) {
        failedImages.push(`HTTP ${response.status()} -> ${url}`)
      }
    })

    await page.goto('/esgotados')
    await page.waitForLoadState('networkidle')

    expect(failedImages).toEqual([])
  })
})
