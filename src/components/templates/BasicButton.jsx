import React from 'react';
import {sun, moon} from "../../data/constants.jsx"

function BasicButton() {
  return (
    <button
      type="button"
      className="fixed p-2 z-10 right-20
      top-4 bg-violet-300 dark:bg-orange-300 text-lg p-1
      rounded-md"
    >
      {sun}
    </button>
  )
}

export default BasicButton;