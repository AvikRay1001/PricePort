import Link from 'next/link'
import React from 'react'
import Image from 'next/image'

const navIcons = [
  {
    src: '/assets/icons/search.svg',
    alt: 'Search'
  },
  {
    src: '/assets/icons/black-heart.svg',
    alt: 'Favorites'
  },
  {
    src: '/assets/icons/user.svg',
    alt: 'Account'
  }
]

const Navbar = () => {
  return (
    <header className='w-full'>
      <nav className='nav'>
        <Link href='/' className='flex items-center gap-1'>
          <Image
            src='/assets/images/logo.png'
            width={50}
            height={50}
            alt='logo'
          />

          <p className='nav-logo'>
            Price<span className='text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-900'>Port</span>
          </p>

        </Link>
      

        <div className='flex items-center gap-5'>
          {navIcons.map((icon) => (
            <Image
              key={icon.alt}
              src={icon.src}
              alt={icon.alt}
              width={28}
              height={28}
              className='object-contain'            
            />
          ))}
        </div>

        
      </nav>
    </header>
  )
}

export default Navbar
