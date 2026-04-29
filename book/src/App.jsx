import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { Experience } from "./components/Experience";
import { useMediaBookTextures } from "./useMediaBookTextures";
import "./index.css";

function App() {
  const { sheets, isReady } = useMediaBookTextures();
  const [page, setPage] = useState(1);
  const bookScale = 1.0;
  const bookPositionY = 0;
  const bookPositionX = 0;
  
  const maxOpenPage = Math.max(1, sheets.length - 1);
  const setClampedPage = (nextPage) => {
    setPage(Math.max(1, Math.min(maxOpenPage, nextPage)));
  };

  useEffect(() => {
    setClampedPage(1);
  }, [sheets]);

  useEffect(() => {
    const handler = (e) => {
      if (e.data === 'book:next') setClampedPage(page + 1);
      if (e.data === 'book:prev') setClampedPage(page - 1);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [page, sheets]);

  // Слушаем обновление страниц из API и сбрасываем на первую страницу
  useEffect(() => {
    const handlePagesUpdated = () => {
      setClampedPage(1);
    };
    window.addEventListener('book:pagesUpdated', handlePagesUpdated);
    return () => {
      window.removeEventListener('book:pagesUpdated', handlePagesUpdated);
    };
  }, []);

  return (
    <main className="book-app-shell">
      <Canvas
        className="book-app-canvas"
        dpr={[1.5, 2]}
        gl={{ 
          alpha: true, 
          antialias: true, 
          powerPreference: "high-performance",
          preserveDrawingBuffer: true
        }}
        camera={{
          position: [0, 0.9, 4.1],
          fov: 42,
        }}
      >
        <Suspense fallback={null}>
          {isReady ? (
            <Experience 
              sheets={sheets} 
              page={page} 
              setPage={setClampedPage}
              bookScale={bookScale}
              bookPositionY={bookPositionY}
              bookPositionX={bookPositionX}
            />
          ) : null}
        </Suspense>
      </Canvas>
    </main>
  );
}

export default App;
