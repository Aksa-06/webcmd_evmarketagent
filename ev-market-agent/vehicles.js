import { cli, Strategy } from '@agentrhq/webcmd/registry';

cli({
  site: 'evmarket',
  name: 'vehicles',
  description: 'Collect current EV vehicle and pricing information from public manufacturer pages',
  access: 'read',
  example: 'webcmd evmarket vehicles -f yaml',
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
    const url = 'https://ev.tatamotors.com/nexon/ev/price.html';

    await page.goto(url, {
      waitUntil: 'domcontentloaded'
    });

    // Tata's pricing information is rendered dynamically.
    // Give the page time to populate the vehicle prices.
    await page.evaluate(
      () => new Promise(resolve => setTimeout(resolve, 5000)));
    const text = await page.evaluate(() => document.body.innerText);

    // Extract a price such as ₹12,49,000.
    const priceMatch = text.match(
      /Price\s+₹([\d]{1,3}(?:,[\d]{2,3})+)/
    );

    const price = priceMatch
      ? Number(priceMatch[1].replace(/,/g, ''))
      : null;

    const retrievedAt = new Date().toISOString();

    const hyundaiUrl =
      'https://www.hyundai.com/in/en/find-a-car/creta-electric/price';

    await page.goto(hyundaiUrl, {
      waitUntil: 'domcontentloaded'
    });

    await page.evaluate(
      () => new Promise(resolve => setTimeout(resolve, 5000)));

    const hyundaiHtml = await page.evaluate(
      () => document.documentElement.outerHTML);
    const hyundaiPriceMatch = hyundaiHtml.match(
      /"price"\s*:\s*"(\d+)"/
    );
    const hyundaiText = await page.evaluate(() => document.body.innerText);

    return [
      {
        manufacturer: 'Tata Motors',
        vehicle: 'Nexon EV',
        price: price,
        source: 'Tata Motors official website',
        source_url: url,
        retrieved_at: retrievedAt,
        raw_text_sample: text.slice(0, 1500)
      },
      {
        manufacturer: 'Hyundai',
        vehicle: 'CRETA Electric',
        price: hyundaiPriceMatch
          ? Number(hyundaiPriceMatch[1])
          : null,
        source: 'Hyundai India official website',
        source_url: hyundaiUrl,
        retrieved_at: new Date().toISOString(),
        raw_text_sample: hyundaiText.slice(0, 1500)
      }
    ].slice(0, kwargs.limit);
  },
});