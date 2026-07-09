import { useGame } from "../game/store.ts";
import { Board } from "./Board.tsx";
import { CameraRig } from "./CameraRig.tsx";
import { Piece } from "./Piece.tsx";
import { ActiveRing } from "./ActiveRing.tsx";
import { Physics } from "@react-three/cannon";
import { Ground } from "./physics/Ground.tsx";
import { DicePair } from "./physics/DicePair.tsx";

export function Scene() {
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