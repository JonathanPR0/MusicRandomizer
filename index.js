const fs = require("fs");
const path = require("path");
const mm = require("music-metadata");
const directoryPath = path.resolve(__dirname, "../Mixer");

const playlist = fs.readdirSync(directoryPath);

// Remove caracteres inválidos para Windows
function sanitizeFileName(name) {
  return name.replace(/[<>:"/\\|?*]/g, "");
}

// Verifica qual comando foi passado como argumento
const command = process.argv[2];

function formatMusicName(songName, artist) {
  const formattedArtist = artist.toLowerCase().includes("watch tower") ? "JW" : artist;
  // Remove 'Ao vivo' e '(Ao vivo)' do songName
  let cleanSongName = songName
    .replace("-", "")
    .replace(/\s*\(Ao vivo\)/gi, "")
    .replace(/\s*Ao vivo/gi, "");

  // Função para capitalizar o nome da música
  function capitalize(text) {
    return text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  }

  const capitalizedSong = capitalize(cleanSongName.trim());
  return `000 - ${capitalizedSong} - ${formattedArtist}`;
}

async function renameWithFormat() {
  const start = Date.now();
  for (const file of playlist) {
    const filePath = path.join(directoryPath, file);
    const extension = path.extname(file);
    let songName = "";
    let artist = "";
    try {
      const metadata = await mm.parseFile(filePath);
      songName = metadata.common.title || path.basename(file, extension);
      artist = metadata.common.artist || "Desconhecido";
    } catch (err) {
      songName = path.basename(file, extension);
      artist = "Desconhecido";
    }

    const newName = sanitizeFileName(formatMusicName(songName, artist));

    try {
      fs.renameSync(filePath, path.join(directoryPath, `${newName}${extension}`));
    } catch (err) {
      console.error(`Erro ao renomear '${filePath}': ${err.message}\n\n`);
    }
  }
  const end = Date.now();
  const seconds = ((end - start) / 1000).toFixed(2);
  console.log(`Tempo para renomear: ${seconds} segundos.`);
}

function randomizeMusic() {
  const start = Date.now();
  const numbers = [];
  playlist.forEach((item) => {
    const name = path.basename(item);

    function randomizer() {
      const randomNumber = Math.floor(Math.random() * playlist.length + 1);
      if (!numbers.includes(randomNumber)) {
        numbers.push(randomNumber);
        return randomNumber.toString().padStart(3, "0");
      } else {
        return randomizer();
      }
    }

    const newName = `${randomizer()}${name.slice(3)}`;
    fs.renameSync(`${directoryPath}/${name}`, `${directoryPath}/${newName}`);
  });
  const end = Date.now();
  const seconds = ((end - start) / 1000).toFixed(2);
  console.log(`Tempo para randomizar: ${seconds} segundos.`);
}

// Executa a função baseada no comando
if (command === "format") {
  renameWithFormat().then(() => {
    console.log("Músicas renomeadas com o formato: 000 - (nome) - (artista)");
  });
} else if (command === "random") {
  randomizeMusic();
  console.log("Músicas randomizadas com sucesso!");
} else {
  console.log("Por favor, use um dos comandos:");
  console.log("- node index.js format  (para renomear no formato artista-música)");
  console.log("- node index.js random  (para randomizar a ordem das músicas)");
}
