import { useEffect, useRef } from 'react'
import { useGame } from '../../game/store.ts'
import { DicePhys } from './DicePhys.tsx'

export function DicePair() {
    const setDiceThrow = useGame(s => s.setDiceThrow)
    const setLastDice = useGame(s => s.setLastDice)

    const d1 = useRef<null | (() => Promise<number>)>(null)
    const d2 = useRef<null | (() => Promise<number>)>(null)

    useEffect(() => {
      const throwBoth = async () => {
        if (!d1.current || !d2.current) return 0
        const [v1, v2] = await Promise.all([d1.current(), d2.current()])
        setLastDice([v1, v2])
        return v1 + v2
      }
      setDiceThrow(throwBoth)
      return () => setDiceThrow(undefined)
    }, [])

    return (
        <>
            <DicePhys position={[-2.0, 1.2, -1.0]} onReady={(fn) => (d1.current = fn)} />
            <DicePhys position={[-1.0, 1.2, -2.0]} onReady={(fn) => (d2.current = fn)} />
        </>
    )
}
