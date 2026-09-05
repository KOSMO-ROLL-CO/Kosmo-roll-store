import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, RotateCcw, Sparkles } from 'lucide-react'
import { useCatalog } from '../store/catalogStore'
import { assetUrl } from '../utils/asset'

type Orbit = 'urbana' | 'cosmica' | 'rebelde' | 'minimal' | 'limitada'

type Answer = {
  label: string
  value: Orbit
  description: string
}

type Question = {
  eyebrow: string
  title: string
  answers: Answer[]
}

const questions: Question[] = [
  {
    eyebrow: '01 / 05',
    title: 'Qual energia mais combina com você?',
    answers: [
      { label: 'Rua, movimento e presença', value: 'urbana', description: 'Meu estilo chega antes de mim.' },
      { label: 'Universo, arte e imaginação', value: 'cosmica', description: 'Prefiro viver em outra frequência.' },
      { label: 'Atitude e personalidade', value: 'rebelde', description: 'Regra demais nunca foi comigo.' },
      { label: 'Menos, mas melhor', value: 'minimal', description: 'Eu escolho cada detalhe.' },
    ],
  },
  {
    eyebrow: '02 / 05',
    title: 'Escolha um rolê.',
    answers: [
      { label: 'Centro da cidade à noite', value: 'urbana', description: 'Concreto, luzes e gente.' },
      { label: 'Festival ou show', value: 'cosmica', description: 'Som alto e cabeça longe.' },
      { label: 'Rolê improvisado', value: 'rebelde', description: 'O melhor plano é não ter plano.' },
      { label: 'Café, galeria ou lugar tranquilo', value: 'minimal', description: 'Pouca gente, boas referências.' },
    ],
  },
  {
    eyebrow: '03 / 05',
    title: 'O que não pode faltar no seu look?',
    answers: [
      { label: 'Uma peça que chama atenção', value: 'urbana', description: 'Quero ser lembrado.' },
      { label: 'Uma estampa que conta uma história', value: 'cosmica', description: 'Roupa também é narrativa.' },
      { label: 'Algo inesperado', value: 'rebelde', description: 'O diferente é o ponto.' },
      { label: 'Um detalhe bem escolhido', value: 'minimal', description: 'Precisão acima de excesso.' },
    ],
  },
  {
    eyebrow: '04 / 05',
    title: 'Se uma peça fosse rara, você...',
    answers: [
      { label: 'Usaria sem pensar duas vezes', value: 'urbana', description: 'Peça boa tem que ir pra rua.' },
      { label: 'Guardaria uma ocasião especial', value: 'cosmica', description: 'Algumas peças têm seu momento.' },
      { label: 'Seria o primeiro a garantir', value: 'limitada', description: 'Se é única, eu quero.' },
      { label: 'Escolheria pela construção', value: 'minimal', description: 'Raridade sem qualidade não vale.' },
    ],
  },
  {
    eyebrow: '05 / 05',
    title: 'Complete a frase: eu visto...',
    answers: [
      { label: 'O que representa minha cidade', value: 'urbana', description: 'Meu lugar faz parte de mim.' },
      { label: 'O que me leva para outros mundos', value: 'cosmica', description: 'Imaginação sem gravidade.' },
      { label: 'O que ninguém espera', value: 'rebelde', description: 'Meu estilo não pede licença.' },
      { label: 'Só o que realmente faz sentido', value: 'minimal', description: 'Intenção em cada escolha.' },
    ],
  },
]

const orbitMeta: Record<Orbit, { name: string; title: string; description: string; categories: string[]; tags: string[] }> = {
  urbana: {
    name: 'Órbita Urbana',
    title: 'Você nasceu para a cidade.',
    description: 'Seu estilo tem presença, movimento e aquela energia de quem transforma qualquer esquina em passarela.',
    categories: ['camisetas', 'bones', 'calcas'],
    tags: ['urbano', 'streetwear', 'street'],
  },
  cosmica: {
    name: 'Órbita Cósmica',
    title: 'Sua cabeça está nas estrelas.',
    description: 'Você procura peças com conceito, narrativa e um pouco de universo para vestir.',
    categories: ['camisetas', 'acessorios'],
    tags: ['cosmico', 'espaco', 'universo', 'alien'],
  },
  rebelde: {
    name: 'Órbita Rebelde',
    title: 'Você não segue a rota.',
    description: 'Seu estilo gosta de contraste, atitude e peças que fogem do óbvio.',
    categories: ['camisetas', 'calcas', 'bones'],
    tags: ['rebelde', 'original', 'streetwear'],
  },
  minimal: {
    name: 'Órbita Minimal',
    title: 'Menos ruído. Mais identidade.',
    description: 'Você sabe que um bom detalhe pode falar mais alto que qualquer excesso.',
    categories: ['acessorios', 'bones', 'camisetas'],
    tags: ['minimal', 'basico', 'essencial'],
  },
  limitada: {
    name: 'Órbita Rara',
    title: 'Você quer sair da órbita comum.',
    description: 'Exclusividade importa. Se a peça é numerada, limitada ou difícil de encontrar, você presta atenção.',
    categories: ['edicoes-limitadas'],
    tags: ['limitada', 'exclusivo', 'colecionavel'],
  },
}

export default function Quiz() {
  const products = useCatalog()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Orbit[]>([])
  const [selected, setSelected] = useState<Orbit | null>(null)
  const [finished, setFinished] = useState(false)

  const result = useMemo(() => {
    if (!finished) return null
    const scores = answers.reduce<Record<Orbit, number>>((acc, answer) => {
      acc[answer] += 1
      return acc
    }, { urbana: 0, cosmica: 0, rebelde: 0, minimal: 0, limitada: 0 })
    const orbit = (Object.keys(scores) as Orbit[]).sort((a, b) => scores[b] - scores[a])[0]
    return { orbit, ...orbitMeta[orbit] }
  }, [answers, finished])

  const recommendations = useMemo(() => {
    if (!result) return []
    const meta = orbitMeta[result.orbit]
    const available = products.filter((product) => product.stock > 0)
    const scored = available.map((product) => {
      const tagScore = product.tags.reduce((score, tag) => {
        return score + (meta.tags.some((wanted) => tag.toLowerCase().includes(wanted)) ? 4 : 0)
      }, 0)
      const categoryScore = meta.categories.includes(product.category) ? 3 : 0
      const limitedScore = result.orbit === 'limitada' && product.edition.isLimited ? 5 : 0
      return { product, score: tagScore + categoryScore + limitedScore }
    })
    return scored.sort((a, b) => b.score - a.score || Number(b.product.isFeatured) - Number(a.product.isFeatured)).slice(0, 3).map(({ product }) => product)
  }, [products, result])

  const choose = (value: Orbit) => setSelected(value)

  const next = () => {
    if (!selected) return
    const nextAnswers = [...answers.slice(0, current), selected]
    setAnswers(nextAnswers)
    setSelected(null)
    if (current === questions.length - 1) {
      setFinished(true)
      return
    }
    setCurrent((value) => value + 1)
  }

  const restart = () => {
    setCurrent(0)
    setAnswers([])
    setSelected(null)
    setFinished(false)
  }

  if (finished && result) {
    return (
      <main className="min-h-screen bg-cosmos text-white pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_20%,rgba(139,92,246,0.28),transparent_38%),radial-gradient(circle_at_10%_80%,rgba(236,72,153,0.14),transparent_30%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/60">
              <Sparkles size={14} /> Resultado da sua órbita
            </div>
            <p className="mt-8 text-kosmo-300 font-semibold tracking-[0.25em] uppercase text-sm">{result.name}</p>
            <h1 className="mt-3 font-display text-4xl sm:text-6xl font-bold tracking-tight">{result.title}</h1>
            <p className="mt-6 text-white/60 text-base sm:text-lg leading-relaxed">{result.description}</p>
          </motion.div>

          {recommendations.length > 0 && (
            <section className="mt-14">
              <div className="flex items-end justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">Selecionadas para você</p>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold mt-1">Sua próxima órbita</h2>
                </div>
                <Link to="/catalogo" className="hidden sm:flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">Ver catálogo <ArrowRight size={15} /></Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {recommendations.map((product, index) => (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
                    <Link to={`/produto/${product.slug}`} className="group block rounded-3xl overflow-hidden bg-white/[0.06] border border-white/10 hover:border-kosmo/50 transition-colors">
                      <div className="aspect-[4/5] bg-white/5 overflow-hidden">
                        <img src={assetUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-5">
                        <p className="text-xs text-white/40 uppercase tracking-wider">{product.category.replaceAll('-', ' ')}</p>
                        <h3 className="mt-1 font-semibold">{product.name}</h3>
                        <p className="mt-2 text-kosmo-300 font-bold">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={restart} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition-colors text-sm font-semibold">
              <RotateCcw size={16} /> Refazer quiz
            </button>
            <Link to="/catalogo" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-kosmo-600 hover:bg-kosmo-500 transition-colors text-sm font-semibold shadow-lg shadow-kosmo/20">
              Explorar catálogo <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const question = questions[current]
  const progress = ((current + 1) / questions.length) * 100

  return (
    <main className="min-h-screen bg-cosmos text-white pt-28 pb-16 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_20%,rgba(139,92,246,0.2),transparent_30%),radial-gradient(circle_at_85%_75%,rgba(236,72,153,0.12),transparent_28%)]" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"><ArrowLeft size={16} /> Voltar</Link>

        <div className="mt-10 max-w-2xl">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/40 mb-3">
            <span>Qual é sua órbita?</span>
            <span>{question.eyebrow}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div className="h-full bg-kosmo-500 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.35 }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.section key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }} className="mt-12">
            <p className="text-kosmo-300 font-semibold text-sm uppercase tracking-[0.2em]">Descubra seu estilo</p>
            <h1 className="mt-3 font-display text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl">{question.title}</h1>

            <div className="grid sm:grid-cols-2 gap-3 mt-9">
              {question.answers.map((answer) => {
                const isSelected = selected === answer.value
                return (
                  <button key={answer.value} onClick={() => choose(answer.value)} className={`group relative text-left rounded-2xl p-5 border transition-all duration-200 ${isSelected ? 'border-kosmo bg-kosmo/15 shadow-lg shadow-kosmo/10' : 'border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07]'}`}>
                    <span className={`absolute top-4 right-4 flex items-center justify-center w-6 h-6 rounded-full border transition-all ${isSelected ? 'bg-kosmo border-kosmo text-white' : 'border-white/15 text-transparent'}`}><Check size={14} /></span>
                    <span className="block pr-8 font-semibold text-lg">{answer.label}</span>
                    <span className="block mt-2 text-sm text-white/45 leading-relaxed">{answer.description}</span>
                  </button>
                )
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <button disabled={!selected} onClick={next} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-cosmos font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/90 transition-colors">
                {current === questions.length - 1 ? 'Descobrir minha órbita' : 'Próxima'} <ArrowRight size={16} />
              </button>
            </div>
          </motion.section>
        </AnimatePresence>
      </div>
    </main>
  )
}
