import React from 'react';

function Intro() {
    return (
        <div className="flex items-center 
        justify-center flex-col text-center pt-10
        pb-6">
            <h1 className="text-4x1 md:text-7x1
            dark:text-white mb-1 md:mb-3 font-bold"></h1>
            <p className="text-md md:text-xl mb-3
            font-bold"> Dylan Chima-Sanchez </p>
            <p className="text-md font-bold"> Recent graduate</p>
            <p className="text-sm max-w-xl mb-6">
                <br />
                I’m a recent graduate looking for entry-level SWE roles. Through university and internships, I’ve become an experienced developer in Python, R, and C++, and proficient with a variety of IDEs, containerization, and version-control tools. I have experience creating tools for interpreting data into knowledge graphs and writing bindings for lower-level GPU-accelerated primitives - by learning frequently used machine learning and data science frameworks in Python. I'm interested in current innovations in LLMs, high-performance computing, memory architecture, and their impact on science and society.
                <br />
                <a
                    href="/assets/resume.pdf"
                    target="_blank"
                    className="text-cyan-600 hover:underline
                    underline-offset-2 decoration-2
                    decoration-red-600"
                    rel="noreferrer noopener"
                > My experience
                </a>
                <br />
                Feel free to contact me if you want to collaborate together on something, ask me questions, or anything else!
                {/*<br />
                I have experience as a front end developer, back end developer, data scientist,
                and researcher, as shown through my{' '}
                <a
                    href="/assets/resume.pdf"
                    target="_blank"
                    className="text-cyan-600 hover:underline
                    underline-offset-2 decoration-2
                    decoration-red-600"
                    rel="noreferrer noopener"
                > current resume
                </a>{' '}
                . Below, I've displayed my most recent and relevant projects, with links and frameworks provided. I also have a way for you to contact me if you want to collaborate together on something, ask me questions, or something else.*/}
            </p>
        </div>
    )
}

export default Intro;