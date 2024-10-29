const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
   const { url } = req.query;

   if (!url) {
      return res.status(400).json({ error: 'URL is required' });
   }

   try {
      const browser = await puppeteer.launch({
         headless: true,
         args: ['--no-sandbox', '--disable-setuid-sandbox'],
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

      await page.goto(url, { waitUntil: 'networkidle2' });
      await browser.close();

      res.json({ networkRequests });
   } catch (error) {
      console.error('Error capturing network requests:', error);
      res.status(500).json({ error: 'Failed to capture network requests' });
   }
};
