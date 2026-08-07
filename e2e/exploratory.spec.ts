import { test, expect } from '@playwright/test'

test.describe('Testes Exploratórios Automatizados (Monkey / Fuzzing)', () => {
  test('deve navegar de forma estocástica sem capturar uncaught exceptions no console', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    const routes = ['/', '/catalogo', '/sobre', '/cupons', '/vale-presente', '/contato', '/checkout']

    for (const route of routes) {
      await page.goto(route)
      await page.waitForTimeout(300)

      // Click random interactive elements if available
      const buttons = page.locator('button:visible')
      const count = await buttons.count()
      if (count > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(count, 3))
        try {
          await buttons.nth(randomIndex).click({ timeout: 1000 })
        } catch {
          // Ignore clicks that navigate away or trigger modal closes
        }
      }
    }

    // Ensure no uncaught fatal JS crashes were produced in console
    const fatalErrors = consoleErrors.filter(
      (err) => err.includes('Uncaught') || err.includes('TypeError')
    )
    expect(fatalErrors).toEqual([])
  })
})
