import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  PiggyBank,
  LineChart,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

/** Hero visual distintivo com orbs, bento features e chart animado */
export const HeroVisual: React.FC<{ classes: Record<string, string> }> = ({ classes }) => (
  <div className="w-full max-w-xl relative">
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border bg-white/5 border-white/10 text-white/80 backdrop-blur"
    >
      <Sparkles size={14} className="text-violet-400" /> Novo • IA financeira integrada{' '}
      <ArrowRight size={12} />
    </motion.div>

    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`${classes.logo} mt-6`}
    >
      <span className="text-4xl font-bold text-white tracking-tighter">$</span>
    </motion.div>

    <motion.h1
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className={classes.heroTitle}
    >
      Controle suas
      <br />
      finanças com
      <br />
      <span className={classes.gradientText}>precisão</span>
    </motion.h1>

    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className={classes.heroDesc}
    >
      Bento financeiro com automação e IA. Menos planilha, mais decisão.
    </motion.p>

    <div className="flex flex-col gap-4">
      {[
        {
          icon: LayoutDashboard,
          color: '#a855f7',
          title: 'Bento & dashboards vivos',
          desc: 'KPIs com sparklines e drill-down',
        },
        {
          icon: PiggyBank,
          color: '#3b82f6',
          title: 'Fluxo sem fricção',
          desc: 'Chat e importação automática',
        },
        {
          icon: LineChart,
          color: '#00d9b5',
          title: 'Previsão com IA',
          desc: 'Análise que antecipa, não só relata',
        },
      ].map(({ icon: IconCmp, color, title, desc }, i) => (
        <motion.div
          key={title}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 + i * 0.08 }}
          className="flex items-center gap-4 group"
        >
          <div
            className="w-11 h-11 flex items-center justify-center rounded-xl border backdrop-blur"
            style={{ color, background: `${color}14`, borderColor: `${color}30` }}
          >
            <IconCmp size={18} />
          </div>
          <div>
            <h3 className={classes.featureTitle}>{title}</h3>
            <p className={classes.featureDesc}>{desc}</p>
          </div>
        </motion.div>
      ))}
    </div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="flex items-center gap-3 mt-8"
    >
      <div className="flex -space-x-2">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="w-7 h-7 rounded-full border-2 border-white/10 bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-[10px] font-bold text-white"
          >
            {String.fromCharCode(64 + n)}
          </div>
        ))}
      </div>
      <div className="text-xs leading-tight">
        <div className="flex items-center gap-1 font-medium text-white">
          ★★★★★ <span className="text-white/60">4.9/5</span>
        </div>
        <div className="text-white/60">+2.400 usuários ativos</div>
      </div>
      <div className="ml-auto hidden sm:flex items-center gap-1.5 text-xs text-white/70">
        <ShieldCheck size={14} className="text-emerald-400" /> LGPD e criptografia
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65 }}
      className="relative h-44 mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur p-3"
    >
      <div className="absolute bottom-3 left-3 flex items-end gap-2 h-[110px]">
        {[30, 55, 80, 65, 100, 130, 160].map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}px` }}
            transition={{ delay: 0.7 + i * 0.05, type: 'spring', stiffness: 120 }}
            className="w-7 rounded-t bg-gradient-to-t from-violet-500/15 to-violet-500/45"
          />
        ))}
      </div>
      <svg
        className="absolute inset-0 w-full h-full p-3"
        viewBox="0 0 400 180"
        preserveAspectRatio="none"
      >
        <path
          d="M0 150 C40 140 60 120 100 130 C140 140 145 90 180 95 C220 100 225 145 260 120 C300 90 310 100 335 50 C350 25 375 20 400 5"
          fill="none"
          stroke="#00d9b5"
          strokeWidth="2.5"
          className="drop-shadow-[0_0_8px_rgba(0,217,181,0.35)]"
        />
      </svg>
      <div className="absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
        +12.4% este mês
      </div>
    </motion.div>
  </div>
);
