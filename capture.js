const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

module.exports = async (req, res) => {
   const { url } = req.query;

   if (!url) {
      return res.status(400).json({ error: 'URL is required' });
   }

   try {
      const browser = await puppeteer.launch({
         args: chromium.args,
         executablePath: await chromium.executablePath,
         headless: chromium.headless,
      });
      const page = await browser.newPage();

      const networkRequests = [];
      page.on('request', (request) => {
         networkRequests.push({
            url: request.url(),
            method: request.method(),
            headers: request.headers(),
         });
      });

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await browser.close();

      res.json({ networkRequests });
   } catch (error) {
      console.error('Error capturing network requests:', error);
      res.status(500).json({ error: 'Failed to capture network requests' });
   }
};
