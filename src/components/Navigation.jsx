import React from 'react';
import { Link } from 'react-router-dom';
import ThemeButton from './ThemeButton.jsx';
import {github, insta, mail} from "../data/social_icons.jsx";

function Navigation() {
  return (
    {/*<div className="h-20 bg-stone-100 dark:bg-stone-500 justify-center mr-1 mt-1 flex">*/},
    <div className="h-20 bg-stone-100 dark:bg-stone-800 dark:text-white justify-center flex">
      <ThemeButton />
      <div className="h-8 flex justify-end relative top-5 right-1/4">
        <div className="border-stone-900 dark:border-white inline-block px-1 py-0.5 border-2 rounded-md"><Link to="/">Home</Link></div>
        <div className="border-stone-900 dark:border-white inline-block px-1 py-0.5 border-2 rounded-md"><Link to="/poliviz">Visualizations</Link></div>
        {/*<div className="border-stone-900 dark:border-white inline-block px-1 py-0.5 border-2 rounded-md"><Link to="/page2">Page{' '}2</Link></div>
        <div className="border-stone-900 dark:border-white inline-block px-1 py-0.5 border-2 rounded-md"><Link to="/page3">Page{' '}3</Link></div>*/}
      </div>
      <div className="h-8 flex justify-end relative top-5 left-1/4">
        <div className="border-stone-900 dark:border-white inline-block px-1 py-0.5 border-2 rounded-md">
          <a href="https://github.com/betochimas/">{github}</a>
        </div>
        {/*<div className="border-stone-900 dark:border-white inline-block px-1 py-0.5 border-2 rounded-md">
          <a href="https://www.google.com">{insta}</a>
        </div>*/}
        <div className="border-stone-900 dark:border-white inline-block px-1 py-0.5 border-2 rounded-md">
          <a href="mailto:da-chimasanchez@berkeley.edu">{mail}</a>
        </div>
      
      </div>
    </div>
  )
}

export default Navigation;