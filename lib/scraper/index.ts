import axios from "axios";
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice } from "../utils";

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
        const currentPrice = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base')
        );
        

        const originalPrice = extractPrice(
            $('#priceblock_ourprice'),
            $('.a-price.a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#pricebock_dealprice'),
            $('.a-size-base.a-color-price')
        );

        const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

        const images = $('#imgBlkFront').attr('data-a-dynamic-image') || $('#landingImage').attr('data-a-dynamic-image') || '{}';

        const imageUrls = Object.keys(JSON.parse(images));

        const currency = extractCurrency($('.a-price-symbol'));

        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g,'');

        const description = extractDescription($);

        //construct data object with scraped information
        const data = {
            url,
            currency: currency || 'Rs.',
            image: imageUrls[0],
            title,
            currentPrice: Number(currentPrice) || Number(originalPrice),
            originalPrice: Number(originalPrice) || Number(currentPrice),
            priceHistory: [],
            discountRate: Number(discountRate),
            category: 'category',
            reviewsCount: 100,
            isOutOfStock: outOfStock,
            description: description,
            lowestPrice: Number(currentPrice) || Number(originalPrice),
            highestPrice: Number(originalPrice) || Number(currentPrice),
            averagePrice: Number(currentPrice) || Number(originalPrice),
        }

        return data;

    } catch (error: any) {
        throw new Error(`Failed to scrape product: ${error.message}`);
    }
}