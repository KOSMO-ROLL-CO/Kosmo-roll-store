import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthProvider'
import { OrderProvider } from '../../context/OrderProvider'
import { KosmoProvider } from '../../context/KosmoProvider'
import { CartProvider } from '../../context/CartProvider'
import { useCart } from '../../context/CartContext'
import ProductCard from '../../components/ProductCard'
import CartDrawer from '../../components/CartDrawer'
import Header from '../../components/Header'
import type { Product } from '../../types'

const product: Product = {
  id: 'prod-1',
  name: 'Camiseta Kosmo Roll Over',
  slug: 'camiseta-kosmo-roll-over',
  description: 'Camiseta premium',
  shortDescription: 'Camiseta',
  price: 199.9,
  images: ['/test.jpg'],
  category: 'camisetas',
  sizes: ['P', 'M', 'G', 'GG'],
  colors: [{ name: 'Preto', hex: '#000000', available: true }],
  edition: { current: 1, total: 100, isLimited: false },
  tags: ['camiseta'],
  isNew: true,
  isFeatured: true,
  stock: 10,
}

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <AuthProvider>
        <OrderProvider>
          <KosmoProvider>
            <CartProvider>{children}</CartProvider>
          </KosmoProvider>
        </OrderProvider>
      </AuthProvider>
    </MemoryRouter>
  )
}

function CartProbe() {
  const { totalItems } = useCart()
  return <span data-testid="cart-count">{totalItems}</span>
}

function OpenCartProbe() {
  const { addItem, openCart } = useCart()
  React.useEffect(() => {
    addItem(product, 'M', product.colors[0], 2)
    openCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <CartDrawer />
}

describe('ProductCard (Componente)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renderiza nome, preço e descrição do produto', () => {
    render(
      <AllProviders>
        <ProductCard product={product} />
      </AllProviders>
    )

    expect(screen.getByRole('heading', { name: 'Camiseta Kosmo Roll Over' })).toBeInTheDocument()
    expect(screen.getByText('R$ 199,90')).toBeInTheDocument()
    expect(screen.getByText('Camiseta')).toBeInTheDocument()
  })

  it('link aponta para a página de detalhe do produto', () => {
    render(
      <AllProviders>
        <ProductCard product={product} />
      </AllProviders>
    )

    const link = screen.getByRole('link', { name: /Camiseta Kosmo Roll Over/ })
    expect(link).toHaveAttribute('href', '/produto/camiseta-kosmo-roll-over')
  })

  it('botão de favoritos alterna entre adicionar e remover', async () => {
    const user = userEvent.setup()
    render(
      <AllProviders>
        <ProductCard product={product} />
      </AllProviders>
    )

    const wishlistBtn = screen.getByRole('button', { name: 'Adicionar aos favoritos' })
    await user.click(wishlistBtn)

    expect(screen.getByRole('button', { name: 'Remover dos favoritos' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remover dos favoritos' }))
    expect(screen.getByRole('button', { name: 'Adicionar aos favoritos' })).toBeInTheDocument()
  })

  it('quick add adiciona o produto ao carrinho', async () => {
    const user = userEvent.setup()
    render(
      <AllProviders>
        <ProductCard product={product} />
        <CartProbe />
      </AllProviders>
    )

    const quickAdd = screen.getByRole('button', { name: 'Adicionar Camiseta Kosmo Roll Over ao carrinho' })
    await user.click(quickAdd)

    expect(screen.getByTestId('cart-count')).toHaveTextContent('1')
  })
})

describe('CartDrawer (Componente)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('exibe itens, quantidade e total corretos', () => {
    render(<OpenCartProbe />, { wrapper: AllProviders })

    expect(screen.getByRole('heading', { name: 'Sacola' })).toBeInTheDocument()
    expect(screen.getByText('2 itens')).toBeInTheDocument()
    expect(screen.getByText('Camiseta Kosmo Roll Over')).toBeInTheDocument()
    expect(screen.getAllByText('R$ 399,80').length).toBeGreaterThan(0)
  })

  it('incrementa e decrementa a quantidade do item', async () => {
    const user = userEvent.setup()
    render(<OpenCartProbe />, { wrapper: AllProviders })

    await user.click(screen.getByRole('button', { name: 'Aumentar quantidade de Camiseta Kosmo Roll Over' }))
    expect(screen.getByText('3 itens')).toBeInTheDocument()
    expect(screen.getAllByText('R$ 599,70').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Diminuir quantidade de Camiseta Kosmo Roll Over' }))
    expect(screen.getByText('2 itens')).toBeInTheDocument()
  })

  it('remove item e mostra estado de carrinho vazio', async () => {
    const user = userEvent.setup()
    render(<OpenCartProbe />, { wrapper: AllProviders })

    await user.click(screen.getByRole('button', { name: 'Remover Camiseta Kosmo Roll Over' }))

    expect(screen.getByText('Sua sacola está vazia')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explorar Catálogo' })).toBeInTheDocument()
  })

  it('fecha o drawer pelo botão de fechar', async () => {
    const user = userEvent.setup()
    function CloseProbe() {
      const { state, addItem, openCart } = useCart()
      React.useEffect(() => {
        addItem(product, 'M', product.colors[0], 1)
        openCart()
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return (
        <>
          <span data-testid="cart-open">{String(state.isOpen)}</span>
          <CartDrawer />
        </>
      )
    }
    render(<CloseProbe />, { wrapper: AllProviders })

    expect(screen.getByTestId('cart-open')).toHaveTextContent('true')
    await user.click(screen.getByRole('button', { name: 'Fechar carrinho' }))
    expect(screen.getByTestId('cart-open')).toHaveTextContent('false')
  })
})

describe('Header (Componente)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renderiza marca, navegação e CTA de login', () => {
    render(<Header />, { wrapper: AllProviders })

    expect(screen.getByText('KOSMO ROLL')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Catálogo' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Edições Limitadas' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sobre' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Contato' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Entrar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abrir carrinho' })).toBeInTheDocument()
  })

  it('mostra o contador de itens no carrinho quando há itens', async () => {
    const user = userEvent.setup()
    function HeaderProbe() {
      const { addItem } = useCart()
      return (
        <>
          <button
            type="button"
            onClick={() => addItem(product, 'M', product.colors[0], 1)}
          >
            Adicionar produto
          </button>
          <Header />
        </>
      )
    }
    render(<HeaderProbe />, { wrapper: AllProviders })

    await user.click(screen.getByRole('button', { name: 'Adicionar produto' }))

    const cartButton = screen.getByRole('button', { name: 'Abrir carrinho' })
    expect(within(cartButton).getByText('1')).toBeInTheDocument()
  })
})
