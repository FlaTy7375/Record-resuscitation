import { useEffect, useState } from "react";
import {
  MEDIA_BOOK_PAGES,
  SOURCE_PAGE_HEIGHT,
  SOURCE_PAGE_WIDTH,
} from "./mediaBookData";

const parsePercent = (value) => {
  if (typeof value !== "string") return 0;
  return Number.parseFloat(value) / 100;
};

const imageCache = new Map();

const loadSourceImage = (src) => {
  if (!src) return Promise.resolve(null);
  if (imageCache.has(src)) return imageCache.get(src);

  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  imageCache.set(src, promise);
  return promise;
};

const createBlankPage = () => {
  const canvas = document.createElement("canvas");
  canvas.width = SOURCE_PAGE_WIDTH;
  canvas.height = SOURCE_PAGE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#f7efe7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
};

const rasterizePage = async (page) => {
  if (!page?.src) return "";

  const sourceImage = await loadSourceImage(page.src);
  if (!sourceImage) return "";

  const widthRatio = parsePercent(page.width);
  const heightRatio = page.height ? parsePercent(page.height) : 1;
  const leftRatio = parsePercent(page.left || "0%");
  const topRatio = parsePercent(page.top || "0%");

  const displayedWidth = SOURCE_PAGE_WIDTH * widthRatio;
  const displayedHeight = SOURCE_PAGE_HEIGHT * heightRatio;
  if (!displayedWidth || !displayedHeight) return page.src;

  const scaleX = displayedWidth / sourceImage.naturalWidth;
  const scaleY = displayedHeight / sourceImage.naturalHeight;
  if (!scaleX || !scaleY) return page.src;

  const cropX = Math.max(0, (-leftRatio * SOURCE_PAGE_WIDTH) / scaleX);
  const cropY = Math.max(0, (-topRatio * SOURCE_PAGE_HEIGHT) / scaleY);
  const cropWidth = Math.min(
    sourceImage.naturalWidth - cropX,
    SOURCE_PAGE_WIDTH / scaleX
  );
  const cropHeight = Math.min(
    sourceImage.naturalHeight - cropY,
    SOURCE_PAGE_HEIGHT / scaleY
  );

  const canvas = document.createElement("canvas");
  canvas.width = SOURCE_PAGE_WIDTH;
  canvas.height = SOURCE_PAGE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return page.src;

  ctx.drawImage(
    sourceImage,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    SOURCE_PAGE_WIDTH,
    SOURCE_PAGE_HEIGHT
  );

  return canvas.toDataURL("image/png");
};

const buildSheets = (textures) => {
  const normalized = [...textures];
  if (normalized.length % 2 !== 0) {
    normalized.push(createBlankPage());
  }

  const sheets = [];
  for (let i = 0; i < normalized.length; i += 2) {
    sheets.push({
      front: normalized[i],
      back: normalized[i + 1],
    });
  }
  return sheets;
};

export const useMediaBookTextures = () => {
  const [sheets, setSheets] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const prepare = async (pages = MEDIA_BOOK_PAGES) => {
      try {
        const textures = await Promise.all(pages.map(rasterizePage));
        if (!isMounted) return;
        setSheets(buildSheets(textures));
        setIsReady(true);
      } catch (error) {
        console.error("Failed to prepare media book textures", error);
      }
    };

    prepare();
    return () => {
      isMounted = false;
    };
  }, []);

  // Слушаем обновление страниц из API
  useEffect(() => {
    const handlePagesUpdated = async (event) => {
      const { pages } = event.detail;
      const textures = await Promise.all(pages.map(rasterizePage));
      setSheets(buildSheets(textures));
    };

    window.addEventListener('book:pagesUpdated', handlePagesUpdated);
    return () => {
      window.removeEventListener('book:pagesUpdated', handlePagesUpdated);
    };
  }, []);

  return { sheets, isReady };
};
