import { cli, Strategy } from '@agentrhq/webcmd/registry';

cli({
  site: 'evmarket',
  name: 'hyundai',

  description:
    'Collect current Hyundai CRETA Electric pricing from the official Hyundai India website',

  access: 'read',

  example: 'webcmd evmarket hyundai -f json',

  domain: 'evmarket',

  strategy: Strategy.PUBLIC,

  browser: true,

  args: [
    {
      name: 'limit',
      type: 'int',
      default: 10,
      help: 'Maximum number of vehicles to return'
    },
  ],

  columns: [
    'manufacturer',
    'vehicle',
    'price',
    'source',
    'retrieved_at'
  ],

  func: async (page, kwargs) => {
    const url =
      'https://www.hyundai.com/in/en/find-a-car/creta-electric/price';

    await page.goto(url, {
      waitUntil: 'domcontentloaded'
    });

    // Wait for Hyundai's page to finish loading.
    await page.evaluate(
      () => new Promise(resolve => setTimeout(resolve, 5000))
    );

    /*
     * Hyundai exposes the CRETA Electric price
     * inside JSON-LD structured data.
     *
     * Example:
     * "priceCurrency": "INR",
     * "price": "1802000"
     */

    const html = await page.evaluate(
      () => document.documentElement.outerHTML
    );

    const priceMatch = html.match(
      /"price"\s*:\s*"(\d+)"/
    );

    const price = priceMatch
      ? Number(priceMatch[1])
      : null;

    const text = await page.evaluate(
      () => document.body.innerText
    );

    const retrievedAt = new Date().toISOString();

    return [
      {
        manufacturer: 'Hyundai',
        vehicle: 'CRETA Electric',
        price: price,
        source: 'Hyundai India official website',
        source_url: url,
        retrieved_at: retrievedAt,
        raw_text_sample: text.slice(0, 1500)
      }
    ].slice(0, kwargs.limit);
  },
});