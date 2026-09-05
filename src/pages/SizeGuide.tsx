import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Ruler, ArrowRight } from 'lucide-react'

const rows = [['P','48–50 cm','66–69 cm','36–62 kg'],['M','51–53 cm','70–72 cm','63–74 kg'],['G','54–56 cm','73–75 cm','75–88 kg'],['GG','57–60 cm','76–79 cm','89–102 kg'],['XG','61–64 cm','80–84 cm','103+ kg']]

export default function SizeGuide() {
  const [height, setHeight] = useState(175); const [weight, setWeight] = useState(70)
  const recommended = useMemo(() => weight <= 62 ? 'P' : weight <= 74 ? 'M' : weight <= 88 ? 'G' : weight <= 102 ? 'GG' : 'XG', [weight])
  return <div className="min-h-screen py-16 px-4 sm:px-6"><div className="max-w-5xl mx-auto">
    <div className="text-center mb-12"><div className="inline-flex p-3 rounded-2xl bg-kosmo/10 text-kosmo mb-4"><Ruler/></div><h1 className="font-display text-4xl sm:text-5xl font-bold text-cosmos">Encontre seu tamanho</h1><p className="text-cosmos/60 mt-3 max-w-xl mx-auto">Uma estimativa rápida para você comprar sem sair da órbita. A modelagem da peça deve ser o desempate final.</p></div>
    <div className="grid lg:grid-cols-[.8fr_1.2fr] gap-8">
      <div className="rounded-3xl bg-cosmos text-white p-7"><p className="text-kosmo text-xs font-bold uppercase tracking-[.2em]">Calculadora orbital</p><h2 className="font-display text-2xl font-bold mt-2 mb-7">Sua recomendação</h2><label className="block text-sm text-white/60">Altura: <b className="text-white">{height} cm</b></label><input type="range" min="145" max="205" value={height} onChange={e=>setHeight(+e.target.value)} className="w-full accent-kosmo mt-2 mb-6"/><label className="block text-sm text-white/60">Peso: <b className="text-white">{weight} kg</b></label><input type="range" min="40" max="130" value={weight} onChange={e=>setWeight(+e.target.value)} className="w-full accent-kosmo mt-2"/><div className="mt-8 rounded-2xl bg-white/10 p-5"><p className="text-xs text-white/50 uppercase tracking-wider">Tamanho sugerido</p><p className="font-display text-6xl font-bold text-kosmo mt-1">{recommended}</p><p className="text-sm text-white/60 mt-2">Se preferir oversized, considere subir um tamanho.</p></div></div>
      <div className="rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white/70 dark:bg-white/5"><div className="p-6 border-b border-gray-100 dark:border-white/10"><h2 className="font-display text-xl font-bold text-cosmos">Tabela base</h2><p className="text-sm text-cosmos/50 mt-1">Medidas aproximadas da peça.</p></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-cosmos/50 bg-gray-50 dark:bg-white/5"><th className="p-4">Tamanho</th><th className="p-4">Largura</th><th className="p-4">Comprimento</th><th className="p-4">Faixa sugerida</th></tr></thead><tbody>{rows.map(row=><tr key={row[0]} className={`border-t border-gray-100 dark:border-white/10 ${row[0]===recommended?'bg-kosmo/5':''}`}>{row.map((cell,i)=><td key={cell} className={`p-4 ${i===0?'font-bold text-kosmo':''}`}>{cell}</td>)}</tr>)}</tbody></table></div></div>
    </div>
    <div className="text-center mt-10"><Link to="/catalogo" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-kosmo text-white font-semibold hover:bg-kosmo-dark transition-colors">Explorar peças <ArrowRight size={16}/></Link></div>
  </div></div>
}
