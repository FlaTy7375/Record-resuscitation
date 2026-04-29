import { Float } from "@react-three/drei";
import { Book } from "./Book";

export const Experience = ({ sheets, page, setPage, bookScale = 1.18, bookPositionY = 0, bookPositionX = 0 }) => {
  return (
    <>
      <ambientLight intensity={1.4} />
      <directionalLight
        position={[2.5, 5.6, 3.4]}
        intensity={1.1}
      />
      <Float
        rotation-x={-Math.PI / 3.5}
        rotation-z={-Math.PI / 14}
        floatIntensity={0.35}
        speed={1.05}
        rotationIntensity={0.18}
      >
        <Book
          sheets={sheets}
          page={page}
          setPage={setPage}
          scale={bookScale}
          position-y={bookPositionY}
          position-x={bookPositionX}
          rotation-x={Math.PI * (20 / 180)}
          rotation-y={-Math.PI * (40 / 180)}
        />
      </Float>
    </>
  );
};
