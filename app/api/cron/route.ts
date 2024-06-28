import Product from "@/lib/models/product.model";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { connectToDB } from "@/lib/scraper/mongoose"
import { getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice } from "@/lib/utils";
import { NextResponse } from "next/server";

export const maxDuration = 300; //5 minutes
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        connectToDB();

        const products = await Product.find({});

        if(!products) throw new Error("Product not found");

        // 1, SCRAPE LATEST PRODUCT DETAILS & UPDATE DB
        const updatedProducts = await Promise.all(
            products.map(async (currentProduct) => {
                const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);
                if(!scrapedProduct) throw new Error("Product not found");

                const updatedPriceHistory = [
                    ...currentProduct.priceHistory,
                    { price: scrapedProduct.currentPrice }
                ]
    
                const product = {
                    ...scrapedProduct,
                    priceHistory: updatedPriceHistory,
                    lowestPrice: getLowestPrice(updatedPriceHistory),
                    highestPrice: getHighestPrice(updatedPriceHistory),
                    averagePrice: getAveragePrice(updatedPriceHistory),
                }

                const updatedProduct = await Product.findOneAndUpdate(
                    { url: product.url },
                    product
                );


                // 2.CHECK EACH PRODUCT STATUS & SEND MAIL ACCORDINGLY
                const emailNotifType = getEmailNotifType(scrapedProduct, currentProduct);

                if(emailNotifType && updatedProduct.uers.length > 0) {
                    const productInfo = {
                        title: updatedProduct.title,
                        url: updatedProduct.url,
                    }

                    const emailContent = await generateEmailBody(productInfo, emailNotifType);

                    const userEmails = updatedProduct.users.map((user:any) => user.email)

                    await sendEmail(emailContent, userEmails);
                }

                return updatedProduct;
            })
        )

        return NextResponse.json({
            message: 'Ok', data: updatedProducts
        })

    } catch (error) {
        throw new Error(`Error in GET: ${error}`)
    }
}