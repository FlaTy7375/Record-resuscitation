export const SOURCE_PAGE_WIDTH = 876;
export const SOURCE_PAGE_HEIGHT = 1187;

const mediaSrc = (file) =>
  new URL(`../../assets/images/media/${file}.webp`, import.meta.url).href;

const DEFAULT_PAGES = [
  { src: mediaSrc("85f45f37e206ae9bb824ed72e9b6b5c4d607f920"), width: "292.98%", height: "100%", left: "0.05%", top: "0.02%" },
  { src: mediaSrc("85f45f37e206ae9bb824ed72e9b6b5c4d607f920"), width: "292.98%", height: "100%", left: "-99.91%", top: "0%" },
  { src: mediaSrc("85f45f37e206ae9bb824ed72e9b6b5c4d607f920"), width: "292.98%", height: "100%", left: "-193.02%", top: "0.03%" },
  { src: mediaSrc("dcb2c16837a9634e3e0867a20e47b36c163bc3d0"), width: "312.27%", height: "100%", left: "0.06%", top: "0%" },
  { src: mediaSrc("dcb2c16837a9634e3e0867a20e47b36c163bc3d0"), width: "312.27%", height: "100%", left: "-102.56%", top: "0.05%" },
  { src: mediaSrc("dcb2c16837a9634e3e0867a20e47b36c163bc3d0"), width: "312.27%", height: "100%", left: "-209.94%", top: "0.05%" },
  { src: mediaSrc("f75df22086b591a9a7b61b5311e9286ce1d73ba1"), width: "300.46%", height: "100%", left: "0.04%", top: "0.01%" },
  { src: mediaSrc("f75df22086b591a9a7b61b5311e9286ce1d73ba1"), width: "300.46%", height: "100%", left: "-100.26%", top: "0.02%" },
  { src: mediaSrc("f75df22086b591a9a7b61b5311e9286ce1d73ba1"), width: "300.46%", height: "100%", left: "-200.45%", top: "0.05%" },
  { src: mediaSrc("6feaba247871e050dedfc3ee00f4691ba28a0941"), width: "300.84%", height: "100%", left: "0.02%", top: "-0.02%" },
  { src: mediaSrc("6feaba247871e050dedfc3ee00f4691ba28a0941"), width: "300.84%", height: "100%", left: "-100.47%", top: "0.03%" },
  { src: mediaSrc("6feaba247871e050dedfc3ee00f4691ba28a0941"), width: "300.84%", height: "100%", left: "-200.81%", top: "-0.04%" },
  { src: mediaSrc("c3662a70dfa15e319e5c2f63da52883b094be8ee"), width: "307.05%", height: "100%", left: "0.03%", top: "0.06%" },
  { src: mediaSrc("c3662a70dfa15e319e5c2f63da52883b094be8ee"), width: "332.48%", height: "100%", left: "-107.76%", top: "-0.03%" },
  { src: mediaSrc("c3662a70dfa15e319e5c2f63da52883b094be8ee"), width: "279.52%", height: "100%", left: "-174.05%", top: "-1.6%" },
  { src: mediaSrc("4f878a923a2d748974659270b19bac9101e0cb25"), width: "303.68%", height: "100%", left: "0.05%", top: "0%" },
  { src: mediaSrc("4f878a923a2d748974659270b19bac9101e0cb25"), width: "303.68%", height: "100%", left: "-101.78%", top: "0%" },
  { src: mediaSrc("4f878a923a2d748974659270b19bac9101e0cb25"), width: "303.68%", height: "100%", left: "-203.7%", top: "0.02%" },
  { src: mediaSrc("bcf1e3ba3416c09bc6d24e69ed0a8e7447bcd9ce"), width: "301.22%", height: "100%", left: "-0.03%", top: "0%" },
  { src: mediaSrc("bcf1e3ba3416c09bc6d24e69ed0a8e7447bcd9ce"), width: "301.22%", height: "100%", left: "-100.59%", top: "0%" },
  { src: mediaSrc("bcf1e3ba3416c09bc6d24e69ed0a8e7447bcd9ce"), width: "301.22%", height: "100%", left: "-201.27%", top: "0%" },
  { src: mediaSrc("e61944a0668b348f0c2c44ab41ba0670df03f7b3"), width: "302.11%", height: "100%", left: "-0.03%", top: "0.03%" },
  { src: mediaSrc("e61944a0668b348f0c2c44ab41ba0670df03f7b3"), width: "302.11%", height: "100%", left: "-101.1%", top: "0.03%" },
  { src: mediaSrc("e61944a0668b348f0c2c44ab41ba0670df03f7b3"), width: "302.11%", height: "100%", left: "-202.09%", top: "-0.02%" },
  { src: mediaSrc("dbc02484b4d51d102e5511811cbe8c81ee3d95aa"), width: "303.34%", height: "100%", left: "-0.01%", top: "0.03%" },
  { src: mediaSrc("dbc02484b4d51d102e5511811cbe8c81ee3d95aa"), width: "303.34%", height: "100%", left: "-97.68%", top: "0%" },
  { src: mediaSrc("dbc02484b4d51d102e5511811cbe8c81ee3d95aa"), width: "303.34%", height: "100%", left: "-200.05%", top: "0%" },
];

const getPagesData = () => {
  try {
    const queryParams = new URLSearchParams(window.location.search);
    const imagesParam = queryParams.get("images");

    if (imagesParam) {
      const dynamicUrls = imagesParam.split(",");
      return dynamicUrls.map((url) => ({
        src: url.trim(),
        width: "100%",
        height: "100%",
        left: "0%",
        top: "0%"
      }));
    }
  } catch (e) {
    console.error("URL error", e);
  }

  return DEFAULT_PAGES;
};

export const MEDIA_BOOK_PAGES = getPagesData();