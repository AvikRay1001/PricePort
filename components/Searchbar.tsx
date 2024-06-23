"use client"
import { scrapeAndStoreProduct } from '@/lib/actions';
import {useState, FormEvent} from 'react';

const isValidAmazonProductURL = (url: string) => {
  try{
    const parsedURL = new URL(url);
    const host = parsedURL.hostname;

    if(
      host.includes('amazon.com') ||
      host.includes('amazon') ||
      host.endsWith('amazon')
    ) {
      return true
    }

  }catch(error){
    return false;
  }

  return false;
}

const Searchbar = () => {
  const [searchPrompt, setsetsearchPrompt] = useState('');
  const [isLoading, setisLoading] = useState(false)

  const handleSubmit = async( event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const isValidLink = isValidAmazonProductURL(searchPrompt);

    if(!isValidLink) return alert('Please enter a valid Amazon Product URL');

    try{

      setisLoading(true);
      const product = await scrapeAndStoreProduct(searchPrompt);

    } catch(errro){

      console.log(errro)

    } finally{
      setisLoading(false);
    }
  }

  return (
    <form 
        className='flex flex-wrap mt-12 gap-4'
        onSubmit={handleSubmit}
    >

    <input
        type="text"
        value={searchPrompt}
        onChange={(e) => setsetsearchPrompt(e.target.value)}
        placeholder="Enter product link"
        className="searchbar-input"
    />

    <button type="submit" className="searchbar-btn" disabled={searchPrompt === ''}>
        {isLoading ? 'Searching....' : 'Search'}
    </button>

    </form>
  )
}

export default Searchbar
