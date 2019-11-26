# tetris-ts-immutable
Tetris in TypeScript, now with immutability!

Play it here: https://mbh95.github.io/tetris-ts-immutable/

## Goal
This is an experiment to implement guideline Tetris in TypeScript while keeping as much of the game state immutable as possible. The goal here is for me to learn more about programming with immutable state; specifically what parts of game programming does it work well for and what new challenges does it introduce?

I would imagine that a better way to create a game that is fun to play is to design the game first, then pick the best platform+language+paradigms that let you meet all of your design goals. In this experiment I'm inverting the process and picking the paradigm+language first then using them to implement a well-known game. I believe that holding program behavior constant and varying implementation is a good way to learn about different programming techniques.

## Non-Goals
In the past I have definitely let the languages or tools I happen to be working with influence the design of my API or game in some way because I chose to change my design to accomodate what was easy to accomplish with that set of languages/tools. Sometimes this is a good thing because it leads to a more natural, idiomatic design or allows for fun game mechanics that would have never been discovered otherwise. Here, that accomodation is an non-goal; I want to be forced to adapt my code, not the mechanics of the game.

## Why TypeScript?
I chose TypeScript because it isn't JavaScript and targetting the web takes care of a some of the normal pain-points of game programming:
* [TypeScript docs](https://www.typescriptlang.org/docs/home.html) - Again, it's not JavaScript. Compile-time type-checking is great!
* Distributability - The game can be hosted anywhere, shared with a URL (like this one: https://mbh95.github.io/tetris-ts-immutable/), and played by anyone with a browser.
* [Immutable.js](https://immutable-js.github.io/immutable-js/) - Facebook's immutable data structures library.
* Web APIs - Canvas/WebGL for graphics, Gamepad are easy to use and more than sufficient for simple games.

## Why Tetris?
I chose guideline Tetris for this experiment because I like the game and I'm familiar with it, but also because the Tetris guidelines define fairly strict standard for how the game should play.





