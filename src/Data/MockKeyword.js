const mockFeedbacks = [
  // camera
  { id: "f1", category: "Camera quality", text: "The camera quality is fantastic and super clear!", sentiment: { label: "positive", score: 0.9 }, percentage: "90%" },
  // { id: "f2", category: "Camera quality", text: "Camera is okay but struggles in low light.", sentiment: { label: "neutral", score: 0.4 }, percentage: "40%" },
  // { id: "f3", category: "Camera quality", text: "Terrible camera, blurry photos and slow shutter.", sentiment: { label: "negative", score: 0.2 }, percentage: "20%" },

  // battery
  { id: "f4", category: "Battery life", text: "Battery life lasts all day. Very impressed.", sentiment: { label: "positive", score: 0.8 }, percentage: "80%" },
  // { id: "f5", category: "Battery life", text: "Battery drains quickly and gets hot. Disappointed.", sentiment: { label: "negative", score: 0.3 }, percentage: "30%" },

  // package / shipping
  { id: "f6", category: "Display", text: "Display arrived early and in perfect condition!", sentiment: { label: "positive", score: 0.85 }, percentage: "85%" },
  // { id: "f7", category: "Display", text: "Late delivery, damaged box. Bad experience.", sentiment: { label: "negative", score: 0.25 }, percentage: "25%" },

  // charging
  { id: "f8", category: "Performance", text: "Fast charging is amazing and super convenient.", sentiment: { label: "positive", score: 0.95 }, percentage: "95%" },
  // { id: "f9", category: "Performance", text: "Charging stops randomly. Very annoying.", sentiment: { label: "negative", score: 0.35 }, percentage: "35%" },

  // price/value
  { id: "f10", category: "Price", text: "Great value for money, totally worth it.", sentiment: { label: "positive", score: 0.88 }, percentage: "88%" },
  // { id: "f11", category: "Price", text: "Overpriced for the features offered.", sentiment: { label: "negative", score: 0.4 }, percentage: "40%" },

  // stability/logs
  { id: "f12", category: "Design", text: "App logs helped me troubleshoot quickly. Nice!", sentiment: { label: "positive", score: 0.9 }, percentage: "90%" },
  // { id: "f13", category: "Design", text: "Keeps throwing errors in logs, frustrating.", sentiment: { label: "negative", score: 0.2 }, percentage: "20%" }
];

export default mockFeedbacks;
