import { motion } from 'framer-motion';
import { cardItem } from '../utils/animations';
import AnimatedCounter from './AnimatedCounter';

export default function StatCard({ 
  title, 
  value, 
  unit = '', 
  icon: Icon, 
  backgroundColor = 'bg-white',
  darkBgColor = 'dark:bg-black',
  borderColor = 'border-slate-200',
  darkBorderColor = 'dark:border-zinc-800',
  textColor = 'text-slate-800',
  darkTextColor = 'dark:text-white',
  subtitle,
  badgeText,
  badgeColor = 'text-emerald-500 dark:text-emerald-400',
  maxValue,
  streak,
  goal,
  medalIcon
}) {
  return (
    <motion.div 
      variants={cardItem} 
      whileHover={{ y: -5 }} 
      className={`${backgroundColor} ${darkBgColor} rounded-2xl p-6 shadow-lg dark:shadow-none border ${borderColor} ${darkBorderColor} dark:neon-border-orange transition-all duration-300 relative overflow-hidden group scanline`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={`${textColor} ${darkTextColor} font-bold text-sm transition-colors`}>{title}</h3>
          {streak && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-lg">🔥</span>
              <span className={`text-sm font-bold ${badgeColor}`}>{streak}-Day Streak</span>
            </div>
          )}
          {goal && (
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Goal: {goal}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 bg-blue-500/10 ${textColor} rounded-lg transition-colors dark:shadow-neon-blue`}>
            <Icon size={20} />
          </div>
        )}
        {medalIcon && (
          <div className="text-3xl">{medalIcon}</div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <h2 className={`text-4xl font-black ${textColor} ${darkTextColor} transition-colors tracking-tighter dark:neon-text-orange`}>
          {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
        </h2>
        {unit && <span className="text-slate-400 dark:text-slate-500 font-bold">{unit}</span>}
        {maxValue && <span className="text-slate-400 dark:text-slate-500 font-bold text-lg">/ {maxValue}</span>}
      </div>

      {subtitle && (
        <p className={`${badgeColor} text-xs font-bold mt-2 inline-block transition-colors`}>
          {subtitle}
        </p>
      )}

      {badgeText && (
        <div className={`${badgeColor} text-xs font-bold mt-3 inline-block transition-colors`}>
          {badgeText}
        </div>
      )}

      <div className="absolute -right-4 -bottom-4 bg-blue-500/5 w-24 h-24 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors duration-700 pointer-events-none"></div>
    </motion.div>
  );
}
