module.exports = {
  title: "Leaf",
  description: "Leaf Page",
  base: "/leaf/",
  head: [["link", { rel: "icon", href: "favicon.ico" }]],
  theme: "reco",
  themeConfig: {
    logo: "/leaf.png",
    search: false,
    type: "blog",
    authorAvatar: "/leaf.png",
    noFoundPageByTencent: false,
  },
  plugins: [
    [
      "cursor-effects",
      {
        size: 2,
        shape: "circle",
        zIndex: 999999999,
      },
    ],
  ],
};
