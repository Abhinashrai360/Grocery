import React from 'react'
import { Link } from 'react-router-dom'
import { categories } from '../assets/assets'
import SectionTitle from './SectionTitle'

const Categories = () => {
  return (
    <section className='mt-16'>
      <SectionTitle>Categories</SectionTitle>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 md:gap-6'>
        {categories.map((category, index) => (
          <Link
            key={category.path}
            to={`/products/${category.path.toLowerCase()}`}
            onClick={() => window.scrollTo(0, 0)}
            className='group cursor-pointer py-5 px-3 gap-2 rounded-xl flex flex-col justify-center items-center hover:shadow-lg hover:-translate-y-1 active:scale-95 transition animate-fade-up'
            style={{ backgroundColor: category.bgColor, animationDelay: `${index * 70}ms` }}
          >
            <img
              src={category.image}
              alt=""
              className='group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 max-w-28'
              loading='lazy'
            />
            <p className='text-sm font-medium text-center'>{category.text}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default Categories;
