console.log("Welcome to spotify-Made by Soumyadeep Sinha");
let currentSong = new Audio();
let songs;
let currfolder;

function SecondsToMinutes(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00 / 00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currfolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let as = div.getElementsByTagName("a");

  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(decodeURI(element.href.split(`/${folder}/`)[1])); //change korechi..decode uri lagie
    }
  }
  // add the song list to the songList
  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];

  songUl.innerHTML = "";

  for (const song of songs) {
    // add each song in the ul
    songUl.innerHTML =
      songUl.innerHTML +
      `<li>
        <img src="images/music.svg" class="invert" alt="">
        <div class="info">
          <div class="">${song}</div>
          <div class="">@Soumyadeep</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img src="images/play.svg" class="invert" alt="">
        </div>
      </li>`;
  }

 // attach event listener to each song on the playlist
  let lis = document.querySelector(".songList").getElementsByTagName("li"); 

  Array.from(lis).forEach((e) => {

    e.addEventListener("click", (element) => {
      let songName = e
        .querySelector(".info")
        .firstElementChild.innerHTML.trim();
      playMusic(songName);
    });
  });
  return songs;
}

// playmusic function
const playMusic = (track, pause = false) => {
  currentSong.src = `/${currfolder}/` + track;
  if (!pause) {
    currentSong.play();
    // change the icon to pause
    play.src = "images/pause.svg";
  }
  document.querySelector(".song-info").innerHTML = decodeURI(track);
  document.querySelector(".song-time").innerHTML = "00 / 00";
};

async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let folders = [];
  let array = Array.from(anchors);

  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-2)[0];
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder=${folder} class="card">
          <div class="play">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                stroke="#141B34"
                stroke-width="1.5"
                stroke-linejoin="round"
                fill="#000"
              />
            </svg>
          </div>
          <img src="/songs/${folder}/cover.jpg" alt="image1" />
          <h2>${response.title}</h2>
          <p>${response.description}</p>
        </div>`;
    }
  }

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

// calling the getSong function
async function main() {
  await getSongs("songs/Ncs");
  for (let i = 0; i < songs.length; i++) {
    songs[i] = decodeURI(songs[i]);
  }

  // automatically play the first song when the page loads
  playMusic(songs[0], true);

  //   display all the albums on the page
  displayAlbums();

  // Attach event listener to prev,next and play button..they have been given id's thus we can target them directly..id's=previous,play and next

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      //paused is a state that is either true/false..but the functins to play and pause are .play() and .pause()..thus dont get confused with paused and .pause
      currentSong.play();
      // also change the image from play to pause and vice versa..as the song is playing and needs to be paused thus opposite icons
      play.src = "images/pause.svg";
    } else {
      currentSong.pause();
      play.src = "images/play.svg";
    }
  });

  // listen for time update event on the song being played
  // because we want time in 00:00/total song duration format
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".song-time").innerHTML = `${SecondsToMinutes(
      currentSong.currentTime
    )} / ${SecondsToMinutes(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%"; 
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {

    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";

    currentSong.currentTime = (currentSong.duration * percent) / 100; 
  });

  // add eventlistener on the hamburger to collapse/show the left menu

  document.querySelector(".hamburger").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = "0";
  });

  // add eventlistener on the cross to collapse/show the left menu

  document.querySelector(".close").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = "-120%";
  });

  // add event listener to previous and next button both of them have been given id's hence we can directly target them
  previous.addEventListener("click", () => {
    currentSong.pause();
    console.log("Previous clicked");
    let prevSong = decodeURI(currentSong.src.split("/").slice(-1)[0]);
    
    let index = songs.indexOf(prevSong);
    
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    } else {
      playMusic(songs[songs.length - 1]); //this logic also build by me
    }
  });

  // Add an event listener to next
  next.addEventListener("click", () => {
    currentSong.pause();
    console.log("Next clicked");
    let nextSong = decodeURI(currentSong.src.split("/").slice(-1)[0]);
    
    let index = songs.indexOf(nextSong);
    
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      playMusic(songs[0]); //this logic also build by me
    }
  });

  // Add event listener to the volume range
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      // console.log(e);
      console.log("Setting volume to", e.target.value);

      currentSong.volume = parseInt(e.target.value) / 100;
      if(currentSong.volume >0){
        document.querySelector(".volume > img").src=document.querySelector(".volume > img").src.replace("mute.svg", "volume.svg");
      }
      else if(currentSong.volume == 0){
        document.querySelector(".volume > img").src=document.querySelector(".volume > img").src.replace("volume.svg","mute.svg",);
      }
    });




  // add event listener to mute the track using the speaker icon
  document.querySelector(".volume > img").addEventListener("click", (e) => {
    // now write mute unmute logic
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}
main();
