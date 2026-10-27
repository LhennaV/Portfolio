// Shared sound effects for the customizer, the START scenes, and Stormi.
// The files are made by tools/sounds/gen-sfx.js. Browsers only play sound after the first click.
const sfx = (() => {
    const make = (name, volume, options = {}) => new Howl({
        src: [`assets/sounds/${name}.wav`],
        volume,
        ...options,
        onloaderror: () => console.log(`${name} sound not found`)
    });
    return {
        // customizer
        select: make('select', 0.3),
        deselect: make('deselect', 0.3),
        start: make('start', 0.35),
        stop: make('stop', 0.3),
        // scene actions
        thud: make('thud', 0.35),
        typing: make('typing', 0.25),
        brush: make('brush', 0.3),
        sparkle: make('sparkle', 0.3),
        game: make('game', 0.2),
        snore: make('snore', 0.3),
        // stormi
        steps: make('steps', 0.3, { loop: true }),
        meow: make('meow', 0.5),
        purr: make('purr', 0.35, { loop: true })
    };
})();
