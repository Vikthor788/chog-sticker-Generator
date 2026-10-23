const REPLICATE_API_TOKEN = import.meta.env.VITE_REPLICATE_API_TOKEN;

export async function generateStickerWithAI(chogImageUrl, reaction) {
  const response = await fetch(
    "https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          prompt: `Using the provided image as a strict reference, turn this exact character into a high-quality sticker with a ${reaction} expression. Keep the same art style, colors, clothing, accessories, and overall identity. Do not redesign the character. Add a thick black and white sticker border. Transparent background. Clean, bold, and polished.`,
          image: chogImageUrl,
          aspect_ratio: "1:1",
          output_format: "png",
          output_quality: 90,
          safety_tolerance: 5,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to start generation");
  }

  let prediction = await response.json();

  // Poll until complete
  while (
    prediction.status !== "succeeded" &&
    prediction.status !== "failed"
  ) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const pollRes = await fetch(prediction.urls.get, {
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
      },
    });

    prediction = await pollRes.json();
  }

  if (prediction.status === "failed") {
    throw new Error(prediction.error || "Generation failed");
  }

  // Flux usually returns an array
  return Array.isArray(prediction.output)
    ? prediction.output[0]
    : prediction.output;
}
