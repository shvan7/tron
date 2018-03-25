# Tron
AI controlled Tron / Snake like game

### How to play
- Localy
```sh
git clone https://github.com/nan-academy/tron.git
cd tron

# from here you can just serv the files:
http-server

# if you don't have http-server installed:
npm install -g http-server
```

- Online, just open [nan-academy.github.io/tron](https://nan-academy.github.io/tron?users=random,random)

### Rules
- You have to move every turn *(you can't stay still)*
- Every time you move somewhere you leave a color trail.
- You can only move to a blank tile
- You can't move out of the map *(100 x 100)*
- You can only move to your `left`, `up` or `right`.
  *(Moving `backward` is suicide as you hit your own trail !)*
- If you take to much CPU to decide where to go, you die
- If two players moved to the same spot, they both die
- **Survive as long as you can.**

### End of the game
- Once no players can make a move
- The player with the longest trail wins

### Controls
- `space` toogle autoplay
- `right arrow` play one move
- `up arrow` increase autoplay speed
- `down arrow` lower autoplay speed
- `R` reload the same play
- `S` load a new play (new seed)

### How to write your AI
- Copy the file [/ai/random.js](https://github.com/nan-academy/tron/blob/master/ai/random.js) to /ai/**GITHUB_LOGIN**.js
- You may now edit the `update` function which is called each turn

### Publish your AI
- Fork this repo
- Create file that use your github login as filename in the /ai/ folder
- Push that to master and your are done

