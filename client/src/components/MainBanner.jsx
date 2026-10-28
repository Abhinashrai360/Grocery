import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';

const MainBanner = () => {
    return (
        <div className='relative overflow-hidden rounded-xl'>
            <img src={assets.main_banner_bg} alt="" className='w-full hidden md:block' />
            <img src={assets.main_banner_bg_sm} alt="" className='w-full md:hidden' />

            {/* decorative floating emoji (hidden from screen readers) */}
            <span aria-hidden="true" className='hidden lg:block absolute top-10 right-[18%] text-5xl animate-float'>🍎</span>
            <span aria-hidden="true" className='hidden lg:block absolute bottom-16 right-[30%] text-4xl animate-float [animation-delay:1.2s]'>🥕</span>
            <span aria-hidden="true" className='hidden md:block absolute top-1/3 right-[8%] text-4xl animate-float [animation-delay:2.2s]'>🥦</span>

            <div className='absolute inset-0 flex flex-col items-center md:items-start justify-center px-4 md:px-16 lg:px-24'>
                <span className='hidden sm:inline-block mb-3 px-4 py-1 rounded-full bg-white/80 backdrop-blur text-primary-dull text-sm font-medium animate-fade-up'>
                    🌱 Fresh groceries, delivered
                </span>

                <h1 className='text-3xl md:text-5xl lg:text-6xl font-bold max-w-xl text-center md:text-left leading-tight animate-fade-up [animation-delay:100ms]'>
                    <span className='text-gradient'>Freshness</span> You Can Trust, Savings You Will Love!
                </h1>

                <div className='flex items-center gap-4 mt-6 animate-fade-up [animation-delay:200ms]'>
                    <Link
                        to="/products"
                        className='group flex items-center gap-2 px-7 md:px-9 py-3 bg-primary hover:bg-primary-dull hover:shadow-lg active:scale-95 transition rounded-full text-white cursor-pointer'
                    >
                        Shop now
                        <img src={assets.white_arrow_icon} className='transition group-hover:translate-x-1' alt="" />
                    </Link>

                    <Link
                        to="/products"
                        className='group flex items-center gap-2 px-7 md:px-9 py-3 bg-white hover:bg-gray-100 hover:shadow-lg active:scale-95 transition rounded-full text-gray-700 cursor-pointer'
                    >
                        Explore deals
                        <img src={assets.black_arrow_icon} className='transition group-hover:translate-x-1' alt="" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default MainBanner;
