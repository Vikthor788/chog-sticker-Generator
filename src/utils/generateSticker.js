export async function generateSticker(chogImageUrl, reaction, chogId) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 512;
  canvas.height = 512;

  const chogImg = await loadImage(chogImageUrl);
  ctx.drawImage(chogImg, 30, 30, 452, 452);

  // Reaction overlay
  try {
    const overlay = await loadImage(`/overlays/${reaction}.png`);
    ctx.drawImage(overlay, 0, 0, 512, 512);
  } catch (e) {
    console.log("Overlay not found, skipping");
  }

  // Sticker border
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 18;
  roundRect(ctx, 10, 10, 492, 492, 40);
  ctx.stroke();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 8;
  roundRect(ctx, 20, 20, 472, 472, 32);
  ctx.stroke();

  // ID Badge
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  roundRect(ctx, 340, 430, 150, 56, 16);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText(`#${chogId}`, 365, 468);

  return canvas.toDataURL("image/png");
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
