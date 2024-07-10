import React from 'react';

function Intro() {
    return (
        <div className="flex items-center 
        justify-center flex-col text-center pt-20
        pb-6">
            <h1 className="text-4x1 md:text-7x1
            dark:text-white mb-1 md:mb-3 font-bold"></h1>
            <p className="text-base md:text-xl mb-3
            font-medium"> Dylan Chima-Sanchez </p>
            <p className="text-sm max-w-xl mb-6 font-bold">
                Recent graduate
                <br />
                I have experience as a front end developer, back end developer, data scientist,
                and researcher, as shown through my{' '}
                <a
                    href="google.com"
                    target="_blank"
                    className="text-cyan-600 hover:underline
                    underline-offset-2 decoration-2
                    decoration-red-600"
                    rel="noreferrer noopener"
                > current resume
                </a>{' '}
                . Below, I've displayed my most recent and relevant projects, with links and frameworks provided. I also have a way for you to contact me if you want to collaborate together on something, ask me questions, or something else.
            </p>
        </div>
    )
}

export default Intro;