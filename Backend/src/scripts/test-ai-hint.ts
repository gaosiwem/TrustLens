import { OpenAIProvider } from "../modules/ai/openai.provider.js";

async function test() {
  const provider = new OpenAIProvider();
  const brand = "Vodacom";
  const hint = "vodacom.co.za";

  console.log(`Testing with Brand: ${brand}, Hint: ${hint}`);
  const result = await provider.getBrandDomain(brand, hint);
  console.log(`Final Result: ${result}`);
}

test();
