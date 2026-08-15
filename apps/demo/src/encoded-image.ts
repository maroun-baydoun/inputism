// Convert the local JPEG into the same data-URL shape an application can
// provide after reading an encoded image value.
export async function loadEncodedImage(source: string) {
  const response = await fetch(source);
  if (!response.ok) {
    throw new Error(`Could not load encoded image source: ${source}`);
  }

  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Could not encode image source"));
    });
    reader.addEventListener("error", () => {
      reject(reader.error ?? new Error("Could not encode image source"));
    });
    reader.readAsDataURL(blob);
  });
}
