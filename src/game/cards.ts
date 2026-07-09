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

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
