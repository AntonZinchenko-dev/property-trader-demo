export type CardEffect =
  | { kind: 'money'; delta: number }         
  | { kind: 'move_to'; tile: number }         
  | { kind: 'go_to_jail' }                  

export type Card = {
  id: string
  title: string
  text: string
  effect: CardEffect
}

export const CHANCE_DECK: Card[] = [
  {
    id: 'ch_money_50',
    title: 'Бонус!',
    text: 'Получите $50',
    effect: { kind: 'money', delta: +50 },
  },
  {
    id: 'ch_money_-50',
    title: 'Штраф',
    text: 'Заплатите $50',
    effect: { kind: 'money', delta: -50 },
  },
  {
    id: 'ch_start',
    title: 'На старт',
    text: 'Переместитесь на START и получите $200',
    effect: { kind: 'move_to', tile: 0 },
  },
  {
    id: 'ch_jail',
    title: 'В тюрьму',
    text: 'Отправляйтесь прямо в тюрьму. Не проходите START',
    effect: { kind: 'go_to_jail' },
  },
]

export const CHEST_DECK: Card[] = [
  {
    id: 'cc_money_200',
    title: 'Наследство',
    text: 'Получите $200',
    effect: { kind: 'money', delta: +200 },
  },
  {
    id: 'cc_money_150',
    title: 'Премия на работе',
    text: 'Получите $150',
    effect: { kind: 'money', delta: +150 },
  },
  {
    id: 'cc_money_100',
    title: 'Возврат налога',
    text: 'Получите $100',
    effect: { kind: 'money', delta: +100 },
  },
  {
    id: 'cc_money_50',
    title: 'Дивиденды',
    text: 'Получите $50',
    effect: { kind: 'money', delta: +50 },
  },
  {
    id: 'cc_money_25',
    title: 'Возврат переплаты',
    text: 'Получите $25',
    effect: { kind: 'money', delta: +25 },
  },
  {
    id: 'cc_money_-100',
    title: 'Ремонт дома',
    text: 'Заплатите $100',
    effect: { kind: 'money', delta: -100 },
  },
  {
    id: 'cc_money_-50',
    title: 'Медицинские расходы',
    text: 'Заплатите $50',
    effect: { kind: 'money', delta: -50 },
  },
  {
    id: 'cc_money_-25',
    title: 'Штраф за парковку',
    text: 'Заплатите $25',
    effect: { kind: 'money', delta: -25 },
  },
  {
    id: 'cc_start',
    title: 'На старт',
    text: 'Переместитесь на GO и получите $200',
    effect: { kind: 'move_to', tile: 0 },
  },
  {
    id: 'cc_to_jail_visit',
    title: 'Навестить тюрьму',
    text: 'Переместитесь на клетку JAIL (просто посещение)',
    effect: { kind: 'move_to', tile: 10 },
  },
  {
    id: 'cc_to_free_park',
    title: 'День отдыха',
    text: 'Переместитесь на FREE PARKING',
    effect: { kind: 'move_to', tile: 20 },
  },
  {
    id: 'cc_jail',
    title: 'Под арест',
    text: 'Отправляйтесь прямо в тюрьму',
    effect: { kind: 'go_to_jail' },
  },
]

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
