declare module '../data/state_colors.js' {
    const state_colors: {
        [result: string]: {
            [year: string]: {
                [state: string]: string;
            };
        };
    };
    export default state_colors;
}