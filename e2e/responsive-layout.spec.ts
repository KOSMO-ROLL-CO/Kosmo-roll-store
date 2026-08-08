import { test, expect, type Page } from '@playwright/test'
import path from 'node:path'

async function waitForIdle(page: Page) {
  try {
    await page.waitForLoadState('networkidle', { timeout: 10000 })
  } catch {
    // Segue mesmo que vídeos/imagens mantenham a rede ativa sob execução paralela
  }
}

const VIEWPORTS = [
  { width: 320, height: 568, label: 'iPhone SE (320px)' },
  { width: 360, height: 640, label: 'Android pequeno (360px)' },
  { width: 375, height: 667, label: 'iPhone 8 (375px)' },
  { width: 390, height: 844, label: 'iPhone 14 (390px)' },
  { width: 414, height: 896, label: 'iPhone 11 (414px)' },
  { width: 480, height: 800, label: '480px' },
  { width: 768, height: 1024, label: 'Tablet (768px)' },
  { width: 1024, height: 768, label: '1024px' },
  { width: 1280, height: 800, label: 'Desktop (1280px)' },
  { width: 1440, height: 900, label: 'Desktop (1440px)' },
]

const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/catalogo', name: 'catalogo' },
  { path: '/produto/alien-joia-tee', name: 'produto' },
  { path: '/sobre', name: 'sobre' },
  { path: '/contato', name: 'contato' },
  { path: '/checkout', name: 'checkout' },
]

const SHOT_DIR = 'test-results/responsive'

for (const vp of VIEWPORTS) {
  for (const route of ROUTES) {
    test(`${vp.width}x${vp.height} — ${route.name} sem overflow horizontal`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto(route.path, { waitUntil: 'domcontentloaded' })
      await waitForIdle(page)

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement
        return doc.scrollWidth - doc.clientWidth
      })

      expect(
        overflow,
        `Overflow horizontal de ${overflow}px na rota ${route.path} com viewport ${vp.width}x${vp.height}. Elemento estourando a tela.`
      ).toBeLessThanOrEqual(2)

      await expect(page.locator('body')).toBeVisible()

      await page.screenshot({
        path: path.join(SHOT_DIR, `${vp.width}x${vp.height}-${route.name}.png`),
        timeout: 15000,
      })
    })
  }
}

test.describe('Menu mobile', () => {
  test('abre o menu hambúrguer e mostra a navegação em 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await waitForIdle(page)

    const menuBtn = page.getByRole('button', { name: 'Abrir menu' })
    await expect(menuBtn).toBeVisible()
    await menuBtn.click()
    await expect(page.getByRole('button', { name: 'Fechar menu' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Catálogo' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Edições Limitadas' }).first()).toBeVisible()

    await page.screenshot({
      path: path.join(SHOT_DIR, '375x667-menu-aberto.png'),
    })
  })

  test('esconde a navegação desktop e mostra o botão do carrinho em 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await waitForIdle(page)

    const desktopNavLink = page.getByRole('navigation').first().getByRole('link', { name: 'Contato' })
    await expect(desktopNavLink).toBeHidden()

    await expect(page.getByRole('button', { name: 'Abrir carrinho' })).toBeVisible()
  })
})
