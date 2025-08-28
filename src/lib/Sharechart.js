// shareChart.js
export const shareChart = () => {
  if (navigator.share) {
    navigator.share({
      title: "Sentiment Over Time",
      text: "Check out this sentiment over time chart!",
      url: window.location.href,
    }).catch(() => alert("Sharing failed or cancelled"));
  } else {
    alert("Share not supported in this browser.");
  }
};
