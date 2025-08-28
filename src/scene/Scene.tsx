import { useState } from "react";
import { useGame } from "../game/store.ts";
import { Board } from "./Board.tsx";
import { CameraRig } from "./CameraRig.tsx";
import { Piece } from "./Piece.tsx";
import { Dice } from "./Dice.tsx";
import { ActiveRing } from "./ActiveRing.tsx";
import { Physics } from "@react-three/cannon";
import { Ground } from "./physics/Ground.tsx";
import { DicePhys } from "./physics/DicePhys.tsx";
import { DicePair } from "./physics/DicePair.tsx";

export function Scene() {
    const roll = useGame(s => s.roll)
    const move = useGame(s => s.moveActiveBy)
    const rolling = useGame(s => s.rolling)
    const isMoving = useGame(s => s.isMoving)
    const players = useGame(s => s.players)
    const active = useGame(s => s.active)

    const [lastRoll, setLastRoll] = useState<number | null>(null)

    async function handleRoll() {
        if (rolling || isMoving) return
        const steps = await roll()
        if (steps > 0) {
            setLastRoll(steps)
            await move(steps)
        }
    }

    return (
        <>
            <hemisphereLight intensity={0.3} />
            <directionalLight position={[6, 10, 6]} castShadow intensity={1.1} />

            <Physics
                gravity={[0, -9.81, 0]}
                allowSleep
                broadphase="SAP"
                defaultContactMaterial={{ friction: 0.7, restitution: 0.02 }}
            >
                <Ground />

                <Board />
                <ActiveRing />
                <Piece playerIndex={0} color="#9c6bff" />
                <Piece playerIndex={1} color="#ff7a66" />

                <DicePair />
            </Physics>

            <CameraRig />
        </>
    )
}