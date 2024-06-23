import axios from "axios";
import * as cheerio from 'cheerio';

export async function scrapeAmazonProduct(url: string){
    if(!url) return;
    // curl 'https://sandbox.oxylabs.io/products/' -U 'AvikRay:Avikray_11062004' -x 'unblock.oxylabs.io:60000' -H 'x-oxylabs-geo-location: United States' -k 

    //BrightData proxy configuration
    const username = String(process.env.OXYLABS_USER);
    const password = String(process.env.OXYLABS_PASSWORD);
    const port = 60000;
    const session_id = (1000000 * Math.random()) | 0;

    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password,
        },
        host: 'unblock.oxylabs.io',
        port,
        rejectUnauthorized: false,
    }

    try {
        //Fetch the product page
        const response = await axios.get(url,options);
        const $ = cheerio.load(response.data);

        //Extract the product title
        const title = $('#productTitle').text().trim();
        const currentPrice = extractPrice();

        console.log({title});
    } catch (error: any) {
        throw new Error(`Failed to scrape product: ${error.message}`);
    }
}