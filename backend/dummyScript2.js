console.log("Welcome to spotify");
let currentSong = new Audio();
let songs;
let currfolder;

// time formatting code injected from chatgpt
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
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();
  // console.log(response); //returns the whole songs.html in text

  let div = document.createElement("div");
  div.innerHTML = response; //the whole html returned previoisly is now stored inside the div

  // now from the whole songs html we extract only the anchror tags as they cotain the songs
  let as = div.getElementsByTagName("a"); //now a contains all the a tags of the song html stored in the div

  // Now we can iterate over this as and extract the song info as
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index]; //storing each anchor tag inside an element variable
    // now check if the anchor tags href ends with mp3? then it is a song and hence push into the empty songs array..but as our href links are taken from youtube music hence we can't use the logic..thus we will use startwith("http")
    if (element.href.endsWith(".mp3")) {
      songs.push(decodeURI(element.href.split(`/${folder}/`)[1])); //change korechi..decode uri lagie
    }
  }
  //   console.log(songs);
  // add the song list to the songList
  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0]; //the ul will be stored inside the songUl

  songUl.innerHTML = "";

  for (const song of songs) {
    // add each song in the ul
    songUl.innerHTML =
      songUl.innerHTML +
      `<li>
        <img src="music.svg" class="invert" alt="">
        <div class="info">
          <div class="">${song}</div>
          <div class="">Soumyadeep</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img src="play.svg" class="invert" alt="">
        </div>
      </li>`;
  }

  // play the first song
  // var audio = new Audio(songs[0]);
  // audio.play();

  // attach event listener to each song on the playlist
  let lis = document.querySelector(".songList").getElementsByTagName("li"); //all the li of the html gets listed that we recently added using js..note this is a html collection..thus use array.from to access each elements...how beautiful

  Array.from(lis).forEach((e) => {
    // console.log(e); //returns all the li's how beautiful
    // now we have to somehow access the div inside this li's that contains the song name.

    e.addEventListener("click", (element) => {
      let songName = e
        .querySelector(".info")
        .firstElementChild.innerHTML.trim(); //info div's first element child is the div having the song name..and that div's innnerhtml text is the song name itself..thus we acquired the dong name..Now we can pass this song name to a function to play that song..But before that we have to add an eventlistener on each li's so as to know which li's is clicked on and then extract its song name and pass that to a function hence wrapping the code inside an eventlistener..using.trim() to remove any extra spaces
      playMusic(songName);
    });
  });
  return songs;
}

// playmusic function
const playMusic = (track, pause = false) => {
  // let audio=new Audio("/songs/" + track) //play the song in the path /songs/track(will be replaced by the song name) but this way will cause error when multiple songs are clicked all will play but we want only one audio to be played when clicked hence we made a global variable named current song and each time this function is called we only update the currentSong variable's src that is done only once..thus no multiple song plays
  currentSong.src = `/${currfolder}/` + track;
  if (!pause) {
    currentSong.play();
    // change the icon to pause
    play.src = "pause.svg";
  }

  // now when a current song is being played we want to populate the song name and its duration on the seek bar..or our song-info and song-time container

  document.querySelector(".song-info").innerHTML = decodeURI(track);
  document.querySelector(".song-time").innerHTML = "00 / 00";
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let folders = [];
  let array = Array.from(anchors);

  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];
      //   console.log(e.href.split("/").slice(-2)[0]); //extraxts the folder name from the anchor tags href
      // Gather the metadata(info.json) from the files
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
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

  //   load the playlist when a card is clicked..card will be targeted using their data attribute stores in the dataset
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

// calling the getSong function
async function main() {
  await getSongs("songs/cs");
  // console.log(songs);
  for (let i = 0; i < songs.length; i++) {
    songs[i] = decodeURI(songs[i]);
  }
  //   console.log(songs);

  // automatically play the first song when the page loads
  playMusic(songs[0], true);

  //   display all the albums on the page
  displayAlbums();

  // Attach event listener to prev,next and play button..they have been given id's thus we can target them directly..id's=previous,play and next

  play.addEventListener("click", () => {
    // if the song is paused then clicking on this button plays the song and vice versa thus doing the same using if-else logic
    if (currentSong.paused) {
      //paused is a state that is either true/false..but the functins to play and pause are .play() and .pause()..thus dont get confused with paused and .pause
      currentSong.play();
      // also change the image from play to pause and vice versa..as the song is playing and needs to be paused thus opposite icons
      play.src = "pause.svg";
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });

  // listen for time update event on the song being played
  // because we want time in 00:00/total song duration format
  currentSong.addEventListener("timeupdate", () => {
    // console.log(currentSong.currentTime,currentSong.duration)//this gives the currentSong time and also the total duration of the current song in mili sconds thus we have to convert into minutes:seconds format..thus chat gpt got a function to do the same
    // Now show the correct duration of time converted by the function into the song-time div

    document.querySelector(".song-time").innerHTML = `${SecondsToMinutes(
      currentSong.currentTime
    )} / ${SecondsToMinutes(currentSong.duration)}`; //the function will give in proper seconds and then inserting the time in the appropriate div

    // now we have to move the seekbar circle whenever the song starts playing

    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%"; // simple maths..current time of the song/ total song duration *100 as our left property of the circle is in percentage(0%) hence we have to make the formula in percentage..thus at end concatenate with "%".. now when the song is played the circle will seem moving
  });

  // Now our circle moves properly with the song.. the next thing that we are going to do is whenever we click on the seekbar our circle should come there on the seekabr and our song should also adjust from that point
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    // console.log(e);
    // we have a property named offsetx which shows the mouse click position on the x-axis..we have to use this property of the click event

    // we have a property named getBoundingClientRect() function that defines the cursor position over an element we will use this property to move the circle over the seekbar

    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";

    // until above our circle moves on the seekbar nicely wherever we click but we also want our current song to be played from that position...

    currentSong.currentTime = (currentSong.duration * percent) / 100; //this line enables us to click on the seekbar at any place and our song also starts from that position very good....
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
    // console.log(prevSong);
    let index = songs.indexOf(prevSong);
    // console.log(index);
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
    // console.log(nextSong);
    let index = songs.indexOf(nextSong);
    // console.log(index);
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
    });

  // add event listener to mute the track using the speaker icon
  document.querySelector(".volume > img").addEventListener("click", (e) => {
    // console.log(e.target)
    // now write mute unmute logic
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value=0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document.querySelector(".range").getElementsByTagName("input")[0].value=10;
    }
  });
}
main();

// TODO::Done working perfectly just create some more albums add them images and finaly publish on the website
// Also change the arist name from soumyadeep to respective singers you can store the info in the info.json
