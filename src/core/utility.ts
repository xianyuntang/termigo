export const readFile = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

export const uint8ArrayToString = (u8: Uint8Array) => {
  return String.fromCharCode(...u8);
};
