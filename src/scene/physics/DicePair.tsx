import { useEffect, useRef } from 'react'
import { useGame } from '../../game/store.ts'
import { DicePhys } from './DicePhys.tsx'

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))
const rollFallback = () => 1 + Math.floor(Math.random() * 6)

export function DicePair() {
  const setDiceThrow = useGame(s => s.setDiceThrow)
  const setLastDice  = useGame(s => s.setLastDice)
  const setDiceReady = useGame(s => s.setDiceReady)

  const d1 = useRef<null | (() => Promise<number>)>(null)
  const d2 = useRef<null | (() => Promise<number>)>(null)

  // Промис, который резолвится, когда обе кости готовы
  const readyRef = useRef<{ p: Promise<void>; r: () => void } | null>(null)
  if (!readyRef.current) {
    let r!: () => void
    const p = new Promise<void>(resolve => (r = resolve))
    readyRef.current = { p, r }
  }

  useEffect(() => {
    const tryMarkReady = () => {
      if (d1.current && d2.current) {
        setDiceReady(true)
        readyRef.current?.r()
      }
    }
    tryMarkReady()
  }, [setDiceReady])

  useEffect(() => {
    const throwBoth = async () => {
      if (!d1.current || !d2.current) {
        await Promise.race([readyRef.current?.p ?? Promise.resolve(), sleep(2200)])
      }
      if (!d1.current || !d2.current) {
        const v1 = rollFallback()
        const v2 = rollFallback()
        setLastDice([v1, v2])
        setDiceReady(true)
        return v1 + v2
      }

      const [v1, v2] = await Promise.all([d1.current(), d2.current()])
      setLastDice([v1, v2])
      return v1 + v2
    }

    setDiceThrow(throwBoth)
    return () => setDiceThrow(undefined)
  }, [setDiceThrow, setLastDice, setDiceReady])

  return (
    <>
      <DicePhys position={[-2.0, 1.2, -1.0]} onReady={(fn) => { d1.current = fn; if (d2.current) { setDiceReady(true); readyRef.current?.r() } }} />
      <DicePhys position={[-1.0, 1.2, -2.0]} onReady={(fn) => { d2.current = fn; if (d1.current) { setDiceReady(true); readyRef.current?.r() } }} />
    </>
  )
}