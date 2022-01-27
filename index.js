const fs = require('fs');
const path = require('path');
const mixerDeMusicas = fs.readdirSync('mixer_de_musicas');

const numbers = [];
mixerDeMusicas.map((item) => {
  const name = path.basename(item);

  function randomizer() {
    const randomNumber = Math.floor(Math.random() * mixerDeMusicas.length + 1);
    if (!numbers.includes(randomNumber)) {
      numbers.push(randomNumber);
      return randomNumber.toString().padStart(3, '0');
    } else {
      return randomizer();
    }
  }

  const newName = `${randomizer()}${name.slice(3)}`;
  fs.renameSync(`./mixer_de_musicas/${name}`, `./mixer_de_musicas/${newName}`);
});
