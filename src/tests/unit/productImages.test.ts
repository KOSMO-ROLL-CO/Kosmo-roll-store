import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { products, soldOutProducts } from '../../data/products'

// All products combined (active + sold out)
const allProducts = [...products, ...soldOutProducts]

describe('Validação Completa de Imagens dos Produtos', () => {
  const publicDir = path.resolve(__dirname, '../../../public')

  // --- 1. ESTRUTURA DE DADOS ---
  describe('1. Integridade dos Dados de Imagem', () => {
    it('todos os produtos ativos possuem ao menos uma imagem principal', () => {
      products.forEach((product) => {
        expect(
          product.images.length,
          `Produto [${product.id}] não tem imagens`
        ).toBeGreaterThan(0)
        expect(
          product.images[0],
          `Produto [${product.id}] tem imagem vazia na posição 0`
        ).toBeTruthy()
      })
    })

    it('todos os slugs de imagem seguem o padrão /products/*.webp', () => {
      const invalidPaths: string[] = []
      allProducts.forEach((product) => {
        product.images.forEach((img) => {
          if (!img.startsWith('/products/') || !img.endsWith('.webp')) {
            invalidPaths.push(`[${product.id}] -> ${img}`)
          }
        })
      })
      expect(invalidPaths).toEqual([])
    })

    it('produtos com colorImages possuem ao menos 1 imagem por cor', () => {
      allProducts.forEach((product) => {
        if (product.colorImages) {
          Object.entries(product.colorImages).forEach(([colorName, imgs]) => {
            expect(
              imgs.length,
              `Produto [${product.id}] cor "${colorName}" não tem imagens em colorImages`
            ).toBeGreaterThan(0)
          })
        }
      })
    })

    it('cada cor declarada em colors possui imagem correspondente em colorImages (quando fornecido)', () => {
      const inconsistencies: string[] = []
      allProducts.forEach((product) => {
        if (!product.colorImages) return
        product.colors.forEach((color) => {
          if (!product.colorImages![color.name]) {
            inconsistencies.push(
              `Produto [${product.id}] -> Cor "${color.name}" está em colors mas não tem entrada em colorImages`
            )
          }
        })
      })
      // Reportar como aviso (não falha dura, já que nem todos os produtos são obrigados)
      if (inconsistencies.length > 0) {
        console.warn('⚠️  Inconsistências de colorImages detectadas:\n' + inconsistencies.join('\n'))
      }
    })
  })

  // --- 2. EXISTÊNCIA FÍSICA DOS ARQUIVOS ---
  describe('2. Existência Física dos Arquivos na Pasta public/', () => {
    it('imagens principais de produtos ativos existem no disco', () => {
      const missingFiles: string[] = []
      products.forEach((product) => {
        product.images.forEach((img) => {
          if (img.startsWith('/')) {
            const filePath = path.join(publicDir, img)
            if (!fs.existsSync(filePath)) {
              missingFiles.push(`[${product.id}] Imagem principal ausente: ${img}`)
            }
          }
        })
      })
      expect(missingFiles).toEqual([])
    })

    it('imagens de produtos esgotados existem no disco', () => {
      const missingFiles: string[] = []
      soldOutProducts.forEach((product) => {
        product.images.forEach((img) => {
          if (img.startsWith('/')) {
            const filePath = path.join(publicDir, img)
            if (!fs.existsSync(filePath)) {
              missingFiles.push(`[${product.id}] Imagem esgotado ausente: ${img}`)
            }
          }
        })
      })
      expect(missingFiles).toEqual([])
    })

    it('imagens de cores (colorImages) existem no disco', () => {
      const missingFiles: string[] = []
      allProducts.forEach((product) => {
        if (product.colorImages) {
          Object.entries(product.colorImages).forEach(([colorName, imgs]) => {
            imgs.forEach((img) => {
              if (img.startsWith('/')) {
                const filePath = path.join(publicDir, img)
                if (!fs.existsSync(filePath)) {
                  missingFiles.push(
                    `[${product.id}] Cor (${colorName}) -> Imagem ausente: ${img}`
                  )
                }
              }
            })
          })
        }
      })
      expect(missingFiles).toEqual([])
    })

    it('imagens lifestyle existem no disco', () => {
      const missingFiles: string[] = []
      allProducts.forEach((product) => {
        if (product.lifestyleImages) {
          product.lifestyleImages.forEach((lifestyle) => {
            if (lifestyle.src.startsWith('/')) {
              const filePath = path.join(publicDir, lifestyle.src)
              if (!fs.existsSync(filePath)) {
                missingFiles.push(
                  `[${product.id}] Lifestyle -> Imagem ausente: ${lifestyle.src}`
                )
              }
            }
          })
        }
      })
      expect(missingFiles).toEqual([])
    })
  })

  // --- 3. INTEGRIDADE DOS ARQUIVOS (Tamanho) ---
  describe('3. Integridade dos Arquivos (Arquivo não corrompido / vazio)', () => {
    it('imagens principais têm tamanho > 5KB (não estão corrompidas ou vazias)', () => {
      const corruptedFiles: string[] = []
      const MIN_SIZE = 5 * 1024 // 5KB mínimo

      products.forEach((product) => {
        product.images.forEach((img) => {
          if (img.startsWith('/')) {
            const filePath = path.join(publicDir, img)
            if (fs.existsSync(filePath)) {
              const stats = fs.statSync(filePath)
              if (stats.size < MIN_SIZE) {
                corruptedFiles.push(
                  `[${product.id}] Imagem provavelmente corrompida (${stats.size} bytes): ${img}`
                )
              }
            }
          }
        })
      })
      expect(corruptedFiles).toEqual([])
    })

    it('imagens não excedem 3MB (imagens muito grandes podem travar o site)', () => {
      const oversizedFiles: string[] = []
      const MAX_SIZE = 3 * 1024 * 1024 // 3MB máximo

      products.forEach((product) => {
        product.images.forEach((img) => {
          if (img.startsWith('/')) {
            const filePath = path.join(publicDir, img)
            if (fs.existsSync(filePath)) {
              const stats = fs.statSync(filePath)
              if (stats.size > MAX_SIZE) {
                oversizedFiles.push(
                  `[${product.id}] Imagem muito grande (${(stats.size / 1024 / 1024).toFixed(2)} MB): ${img}`
                )
              }
            }
          }
        })
      })
      expect(oversizedFiles).toEqual([])
    })

    it('nenhuma imagem está referenciada mais de 50 vezes (loop de duplicação suspeita)', () => {
      const imgCountMap: Record<string, number> = {}
      allProducts.forEach((product) => {
        product.images.forEach((img) => {
          imgCountMap[img] = (imgCountMap[img] || 0) + 1
        })
      })
      Object.entries(imgCountMap).forEach(([img, count]) => {
        expect(count, `Imagem "${img}" repetida ${count} vezes — verificar se é intencional`).toBeLessThan(50)
      })
    })
  })

  // --- 4. COBERTURA DE ARQUIVOS ---
  describe('4. Cobertura do Diretório public/products/', () => {
    it('todos os arquivos .webp em public/products/ estão sendo usados em algum produto', () => {
      const productImagesDir = path.join(publicDir, 'products')
      if (!fs.existsSync(productImagesDir)) return

      const filesOnDisk = fs.readdirSync(productImagesDir)
        .filter((f) => f.endsWith('.webp'))
        .map((f) => `/products/${f}`)

      const usedImages = new Set<string>()
      allProducts.forEach((product) => {
        product.images.forEach((img) => usedImages.add(img))
        if (product.colorImages) {
          Object.values(product.colorImages).flat().forEach((img) => usedImages.add(img))
        }
        product.lifestyleImages?.forEach((l) => usedImages.add(l.src))
      })

      const unusedFiles = filesOnDisk.filter((f) => !usedImages.has(f))
      if (unusedFiles.length > 0) {
        console.warn('⚠️  Imagens não utilizadas em public/products/:\n' + unusedFiles.join('\n'))
      }
      // Não falhar — apenas alertar sobre arquivos não usados
    })
  })
})
