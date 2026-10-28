import React from 'react';
import MainBanner from '../components/MainBanner'
import PromoStrip from '../components/PromoStrip'
import Categories from '../components/Categories'
import TopDeals from '../components/TopDeals'
import BestSeller from '../components/BestSeller';
import BottomBanner from '../components/BottomBanner';
import NewsLetter from '../components/NewsLetter';
import Reveal from '../components/Reveal';

const Home = () => {
    return (
        <div className='mt-10'>
            <MainBanner />
            <PromoStrip />
            <Reveal><Categories /></Reveal>
            <Reveal><TopDeals /></Reveal>
            <Reveal><BestSeller /></Reveal>
            <Reveal><BottomBanner /></Reveal>
            <Reveal><NewsLetter /></Reveal>
        </div>
    )
}
export default Home;
