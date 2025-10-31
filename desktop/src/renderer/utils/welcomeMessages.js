// Utility to generate dynamic welcome messages in a scalable, extensible way
// Messages are externalized in a JSON config to make it easy to grow over time.

import config from '../config/welcomeMessages.json';

const DAYS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

// Small helpers
const pick = (arr, rnd = Math.random) => arr[Math.floor(rnd() * arr.length)];
const fmt = (tpl, vars) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));

// Extra templates registry (functions or string templates)
const extraTemplates = [];

// Decide period by hour
const getPeriod = (hour) => (hour < 12 ? 'morning' : hour < 19 ? 'afternoon' : 'night');

// Public API
export function getWelcomeMessage(user, date = new Date(), rnd = Math.random) {
  const name = user?.nombre_usuario || user?.nombre || 'Usuario';
  const ctx = {
    name,
    dayName: DAYS[date.getDay()],
    dayOfMonth: date.getDate(),
    monthName: MONTHS[date.getMonth()],
    hour: date.getHours(),
    period: getPeriod(date.getHours()),
    rnd
  };

  // Build candidate templates from JSON
  const emoji = pick(config.emojis || ['✨'], rnd);
  const vars = { ...ctx, emoji };

  const byPeriod = (config.byPeriod && config.byPeriod[ctx.period]) || [];
  const generic = config.generic || [];

  // Convert string templates to messages using placeholders
  const candidates = [
    ...byPeriod.map((t) => fmt(t, vars)),
    ...generic.map((t) => fmt(t, vars))
  ].filter(Boolean);

  // Also consider extra registered templates
  const extraCandidates = extraTemplates.map((tpl) => {
    try {
      if (typeof tpl === 'function') return tpl(vars);
      if (typeof tpl === 'string') return fmt(tpl, vars);
    } catch {}
    return null;
  }).filter(Boolean);

  const all = [...extraCandidates, ...candidates];
  if (all.length === 0) return `Bienvenido, ${name}`;
  return pick(all, rnd);
}

// Allow external registration of new templates (function or string)
export function registerWelcomeTemplate(template) {
  if (typeof template === 'function' || typeof template === 'string') {
    extraTemplates.push(template);
  }
}
