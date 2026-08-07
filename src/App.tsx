import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'

const Home = lazy(() => import('./pages/Home'))
const Catalog = lazy(() => import('./pages/Catalog'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Edicoes = lazy(() => import('./pages/Edicoes'))
const Sobre = lazy(() => import('./pages/Sobre'))
const Contato = lazy(() => import('./pages/Contato'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const MyAccount = lazy(() => import('./pages/MyAccount'))
const Certificate = lazy(() => import('./pages/Certificate'))
const Validar = lazy(() => import('./pages/Validar'))
const ValePresente = lazy(() => import('./pages/ValePresente'))
const Cupons = lazy(() => import('./pages/Cupons'))
const Esgotados = lazy(() => import('./pages/Esgotados'))
const NotFound = lazy(() => import('./pages/NotFound'))
const EmBreve = lazy(() => import('./pages/EmBreve'))
const Admin = lazy(() => import('./pages/Admin'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-kosmo/20 border-t-kosmo animate-spin" />
        <span className="text-sm text-cosmos/40">Carregando...</span>
      </div>
    </div>
  )
}

function App() {
  const location = useLocation()

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/catalogo" element={<Catalog />} />
                <Route path="/produto/:slug" element={<ProductDetail />} />
                <Route path="/edicoes" element={<Edicoes />} />
                <Route path="/sobre" element={<Sobre />} />
                <Route path="/contato" element={<Contato />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Register />} />
                <Route path="/minha-conta" element={<MyAccount />} />
                <Route path="/vale-presente" element={<ValePresente />} />
                <Route path="/cupons" element={<Cupons />} />
                <Route path="/esgotados" element={<Esgotados />} />
                <Route path="/certificado/:slug" element={<Certificate />} />
                <Route path="/validar" element={<Validar />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="/em-breve" element={<EmBreve />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

export default App
