function reverseString(value) {
  return Array.from(String(value)).reverse().join("");
}

const samples = ["cursor", "café", "a😊b"];
for (const sample of samples) {
  console.log(`${sample} -> ${reverseString(sample)}`);
}
