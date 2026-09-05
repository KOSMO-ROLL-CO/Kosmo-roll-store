import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronDown, Grid3X3, LayoutList, SlidersHorizontal, X } from 'lucide-react'
import { useCatalog } from '../store/catalogStore'
import { CATEGORIES, type Category, type Product } from '../types'
import ProductCard from '../components/ProductCard'

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'best-selling' | 'almost-gone' | 'limited'
const remainingUnits = (p: Product) => p.edition.isLimited ? Math.max(0, p.edition.total - p.edition.current) : p.stock

export default function Catalog() {
  const products = useCatalog(); const [searchParams, setSearchParams] = useSearchParams()
  const [category, setCategory] = useState<Category | 'all'>((searchParams.get('categoria') as Category | 'all') || 'all')
  const [sortBy, setSortBy] = useState<SortOption>('newest'); const [gridCols, setGridCols] = useState<2 | 3>(3)
  const [colors, setColors] = useState<string[]>([]); const [sizes, setSizes] = useState<string[]>([]); const [limitedOnly, setLimitedOnly] = useState(false)
  const [priceMax, setPriceMax] = useState(1000); const [filtersOpen, setFiltersOpen] = useState(false)
  const query = (searchParams.get('busca') || '').trim().toLowerCase()
  const allColors = useMemo(() => [...new Set(products.flatMap((p) => p.colors.map((c) => c.name)))].sort(), [products])
  const allSizes = useMemo(() => [...new Set(products.flatMap((p) => p.sizes))], [products])

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => category === 'all' || p.category === category)
    if (query) result = result.filter((p) => [p.name,p.shortDescription,p.description,p.category,...p.tags].join(' ').toLowerCase().includes(query))
    if (colors.length) result = result.filter((p) => p.colors.some((c) => colors.includes(c.name) && c.available))
    if (sizes.length) result = result.filter((p) => p.sizes.some((s) => sizes.includes(s)))
    if (limitedOnly) result = result.filter((p) => p.edition.isLimited)
    result = result.filter((p) => p.price <= priceMax)
    switch (sortBy) {
      case 'newest': result.sort((a,b) => Number(b.isNew)-Number(a.isNew)); break
      case 'price-asc': result.sort((a,b) => a.price-b.price); break
      case 'price-desc': result.sort((a,b) => b.price-a.price); break
      case 'best-selling': result.sort((a,b) => b.edition.current-a.edition.current); break
      case 'almost-gone': result.sort((a,b) => remainingUnits(a)-remainingUnits(b)); break
      case 'limited': result.sort((a,b) => Number(b.edition.isLimited)-Number(a.edition.isLimited)); break
    }
    return result
  }, [products,category,query,colors,sizes,limitedOnly,priceMax,sortBy])

  const changeCategory = (value: Category | 'all') => { setCategory(value); const next = new URLSearchParams(searchParams); value === 'all' ? next.delete('categoria') : next.set('categoria',value); setSearchParams(next) }
  const toggle = (value: string, current: string[], setter: (v:string[])=>void) => setter(current.includes(value) ? current.filter((v)=>v!==value) : [...current,value])
  const clear = () => { setColors([]); setSizes([]); setLimitedOnly(false); setPriceMax(1000) }
  const activeCount = colors.length + sizes.length + Number(limitedOnly) + Number(priceMax < 1000)

  return <div className="min-h-screen">
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50/50"><div className="max-w-7xl mx-auto text-center"><motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}><h1 className="font-display text-4xl sm:text-5xl font-bold text-cosmos mb-4">Catálogo</h1><p className="text-cosmos/60 max-w-lg mx-auto">Encontre sua próxima peça fora de órbita.</p></motion.div></div></section>
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between gap-3"><div className="flex flex-wrap gap-2">{(['all',...CATEGORIES.map(c=>c.id)] as const).map((id) => <button key={id} onClick={()=>changeCategory(id as Category|'all')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${category===id?'bg-kosmo-600 text-white shadow-lg shadow-kosmo/25':'bg-gray-100 text-cosmos/60 hover:bg-gray-200 dark:hover:bg-white/10'}`}>{id==='all'?'Todos':CATEGORIES.find(c=>c.id===id)?.icon+' '+CATEGORIES.find(c=>c.id===id)?.name}</button>)}</div><button onClick={()=>setFiltersOpen(!filtersOpen)} className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 text-sm font-semibold text-cosmos"><SlidersHorizontal size={16}/> Filtros {activeCount>0 && <span className="w-5 h-5 rounded-full bg-kosmo text-white text-[10px] flex items-center justify-center">{activeCount}</span>}<ChevronDown size={15} className={filtersOpen?'rotate-180':''}/></button></div>
        {filtersOpen && <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5 p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div><p className="text-xs font-bold uppercase tracking-wider text-cosmos/50 mb-3">Cores</p><div className="flex flex-wrap gap-2">{allColors.map(c=><button key={c} onClick={()=>toggle(c,colors,setColors)} className={`px-3 py-1.5 rounded-full text-xs border ${colors.includes(c)?'border-kosmo bg-kosmo/10 text-kosmo':'border-gray-200 dark:border-white/10 text-cosmos/60'}`}>{c}</button>)}</div></div>
          <div><p className="text-xs font-bold uppercase tracking-wider text-cosmos/50 mb-3">Tamanhos</p><div className="flex flex-wrap gap-2">{allSizes.map(s=><button key={s} onClick={()=>toggle(s,sizes,setSizes)} className={`w-10 h-9 rounded-lg text-xs border ${sizes.includes(s)?'border-kosmo bg-kosmo text-white':'border-gray-200 dark:border-white/10 text-cosmos/60'}`}>{s}</button>)}</div></div>
          <div><p className="text-xs font-bold uppercase tracking-wider text-cosmos/50 mb-3">Preço até R$ {priceMax.toFixed(0)}</p><input aria-label="Preço máximo" type="range" min="50" max="1000" step="10" value={priceMax} onChange={e=>setPriceMax(Number(e.target.value))} className="w-full accent-kosmo"/><label className="mt-3 flex items-center gap-2 text-sm text-cosmos/70"><input type="checkbox" checked={limitedOnly} onChange={e=>setLimitedOnly(e.target.checked)} className="accent-kosmo"/> Só edições limitadas</label></div>
          <div className="flex items-end"><button onClick={clear} className="text-sm font-semibold text-cosmos/50 hover:text-kosmo flex items-center gap-2"><X size={15}/> Limpar filtros</button></div>
        </motion.div>}
        <div className="flex items-center justify-between gap-4"><p className="text-sm text-cosmos/60">{filteredProducts.length} {filteredProducts.length===1?'produto':'produtos'} encontrado{filteredProducts.length!==1?'s':''}{query && <> para <span className="text-kosmo font-medium">"{query}"</span></>}</p><div className="flex items-center gap-3"><select value={sortBy} onChange={e=>setSortBy(e.target.value as SortOption)} aria-label="Ordenar produtos" className="text-sm text-cosmos/60 bg-transparent border-none focus:ring-0"><option value="newest">Mais novos</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option><option value="best-selling">Mais vendidos</option><option value="almost-gone">Quase esgotando</option><option value="limited">Edições limitadas</option></select><div className="hidden sm:flex gap-1 border-l pl-3 border-gray-200 dark:border-white/10"><button onClick={()=>setGridCols(3)} aria-label="3 colunas" className={`p-1.5 rounded-lg ${gridCols===3?'bg-kosmo/10 text-kosmo':'text-cosmos/30'}`}><Grid3X3 size={16}/></button><button onClick={()=>setGridCols(2)} aria-label="2 colunas" className={`p-1.5 rounded-lg ${gridCols===2?'bg-kosmo/10 text-kosmo':'text-cosmos/30'}`}><LayoutList size={16}/></button></div></div></div>
      </div>
      {filteredProducts.length ? <div className={`grid gap-6 lg:gap-8 ${gridCols===2?'grid-cols-1 sm:grid-cols-2':'grid-cols-2 lg:grid-cols-3'}`}>{filteredProducts.map((product,index)=><ProductCard key={product.id} product={product} index={index}/>)}</div> : <div className="text-center py-20"><span className="text-6xl block mb-4">🔭</span><h3 className="font-display font-semibold text-xl text-cosmos mb-2">Nenhum produto encontrado</h3><p className="text-cosmos/50">Ajuste os filtros e tente novamente.</p></div>}
    </section>
  </div>
}
