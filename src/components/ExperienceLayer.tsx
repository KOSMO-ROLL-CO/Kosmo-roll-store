import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import { useCatalog } from '../store/catalogStore'

export default function ExperienceLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const location = useLocation()
  const products = useCatalog()
  const [cursor, setCursor] = useState({ x: -100, y: -100, visible: false })
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const stars = Array.from({ length: 70 }, () => ({
      x: Math.random(), y: Math.random(), r: Math.random() * 1.5 + 0.3, a: Math.random(), s: Math.random() * 0.008 + 0.002,
    }))
    let frame = 0
    let raf = 0
    const resize = () => { canvas.width = window.innerWidth * devicePixelRatio; canvas.height = window.innerHeight * devicePixelRatio; ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0) }
    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      stars.forEach((star) => {
        star.a += reduce ? 0 : star.s
        const alpha = 0.15 + (Math.sin(star.a + star.x * 8) + 1) * 0.2
        ctx.globalAlpha = alpha
        ctx.beginPath(); ctx.arc(star.x * window.innerWidth, star.y * window.innerHeight, star.r, 0, Math.PI * 2); ctx.fillStyle = '#FF0082'; ctx.fill()
      })
      frame += 1
      if (!reduce && frame < 12000) raf = requestAnimationFrame(draw)
    }
    resize(); draw(); window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  useEffect(() => {
    const move = (event: MouseEvent) => setCursor({ x: event.clientX, y: event.clientY, visible: true })
    const leave = () => setCursor((value) => ({ ...value, visible: false }))
    window.addEventListener('mousemove', move); document.documentElement.addEventListener('mouseleave', leave)
    return () => { window.removeEventListener('mousemove', move); document.documentElement.removeEventListener('mouseleave', leave) }
  }, [])

  useEffect(() => {
    const match = location.pathname.match(/^\/produto\/([^/]+)/)
    if (!match) return
    const product = products.find((item) => item.slug === match[1])
    if (!product) return
    const remaining = product.edition.isLimited ? Math.max(0, product.edition.total - product.edition.current) : product.stock
    if (remaining > 0 && remaining <= 5) setNotice(`${product.name}: restam só ${remaining} unidade${remaining === 1 ? '' : 's'} em órbita.`)
    else setNotice(null)
  }, [location.pathname, products])

  return <>
    <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 opacity-60" />
    <motion.div aria-hidden="true" className="kosmo-cursor hidden lg:block" animate={{ x: cursor.x - 14, y: cursor.y - 14, opacity: cursor.visible ? 1 : 0 }} transition={{ type: 'spring', stiffness: 700, damping: 35 }} />
    <AnimatePresence>
      {notice && <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="fixed top-24 right-4 z-[60] max-w-sm rounded-2xl border border-kosmo/20 bg-white/95 dark:bg-cosmos-light/95 backdrop-blur-xl p-4 shadow-2xl shadow-kosmo/10">
        <div className="flex items-start gap-3"><Sparkles className="mt-0.5 shrink-0 text-kosmo" size={18} /><p className="text-sm font-medium text-cosmos dark:text-white pr-2">{notice}</p><button onClick={() => setNotice(null)} aria-label="Fechar aviso" className="text-cosmos/40 hover:text-kosmo"><X size={16} /></button></div>
      </motion.div>}
    </AnimatePresence>
  </>
}
