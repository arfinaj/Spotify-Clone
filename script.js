let currentsong= new Audio();
let songs;
let currfolder;
function formatTime(seconds) {
    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Format seconds to always have two digits
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

    // Return the time in "minutes:seconds" format
    return `${minutes}:${formattedSeconds}`;
}



async function getsongs(folder) {
    currfolder=folder;
    let response = await fetch(`http://127.0.0.1:5501/${currfolder}/`);
    let html = await response.text();
    console.log("HTML Response:", html); // Log the HTML response

    // Create a temporary DOM element to parse the HTML
    let div = document.createElement("div");
    div.innerHTML = html;

    // Get all anchor elements
    let anchors = div.querySelectorAll("a");
    console.log("Anchor Tags:", anchors); // Log all anchors

    songs = [];

    // Extract .mp3 file links
    anchors.forEach(anchor => {
        if (anchor.href.endsWith(".mp3")) {
            songs.push(anchor.href.split(`/${currfolder}/`)[1]);
        }
    });

    console.log("Songs:", `/${folder}/`); // Log the extracted songs
    
}


const playMusic=(track,pause=false)=>{
    currentsong.src = `http://127.0.0.1:5501/${currfolder}/${track}`;
   if(!pause){
    currentsong.play()
       play.src="pause.svg"
   }

   document.querySelector(".songinfo").innerHTML=decodeURI(track)
   document.querySelector(".songtime").innerHTML="00:00/00:00"
}

async function displayalbum() {
    try {
        let a = await fetch(`http://127.0.0.1:5501/songs/`);
        if (!a.ok) {
            throw new Error(`Failed to fetch songs directory. Status: ${a.status}`);
        }

        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;

        let anchors = div.getElementsByTagName("a");
        let cardcontainer = document.querySelector(".cardcontainer");

        Array.from(anchors).forEach(async (e) => {
            // Only proceed if the href points to a valid folder under "/songs/"
            if (e.href.includes("/songs/") && e.href.split("/").slice(-2)[0] !== "songs") {
                let folder = e.href.split("/").slice(-2)[0];
                let infoURL = `http://127.0.0.1:5501/songs/${folder}/info.json`;

                try {
                    let a = await fetch(infoURL);
                    if (!a.ok) {
                        console.warn(`Could not fetch info.json for folder: ${folder}. Status: ${a.status}`);
                        return; // Skip this folder if info.json is not found
                    }

                    let response = await a.json();
                    cardcontainer.innerHTML += `
                        <div data-folder="${folder}" class="card">
                            <div class="play">
                                <img src="playgreen.svg" alt="">
                            </div>
                            <img src="/songs/${folder}/cover.jpg" alt="Cover">
                            <h2>${response.title}</h2>
                            <p>${response.description}</p>
                        </div>`;
                } catch (error) {
                    console.error(`Error processing folder: ${folder}`, error);
                }
            }
        });
    } catch (error) {
        console.error("Error in displayalbum:", error);
    }
}


async function main() {
 await getsongs("/songs/cs");
   playMusic(songs[0],true)

   //feffw
   displayalbum()
  
    console.log("Final Songs Array:", songs);

    const songul = document.querySelector(".songlist ul");
    songul.innerHTML = "";
    for (const song of songs) {
        songul.innerHTML=songul.innerHTML+= `<li>
        
    
                        <div class="info">
                            <div>${song}</div>
                            <div>Sheikh Sudais</div>
                        </div>
                        <div class="playnow">
                            <span style="font-size:21px";>Play Now</span>
                        <img width="40" class="invert" src="playbar.svg" alt="">
                    </div>
   </li>`;
    }

    Array.from(songul.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            const songName = e.querySelector(".info").firstElementChild.innerHTML.trim();
            console.log("Song Name:", songName);
            playMusic(songName);
        });
    });

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            const folder = item.currentTarget.dataset.folder; // Retrieve the folder name
            console.log(`Selected Folder: ${folder}`);

            await getsongs(`/songs/${folder}`); // Update the `songs` array with the selected folder's songs

            console.log("Updated Songs Array:", songs);

            // Update the song list UI
            const songul = document.querySelector(".songlist ul");
            songul.innerHTML = ""; // Clear the existing song list
            for (const song of songs) {
                songul.innerHTML += `
                    <li>
                        <div class="info">
                            <div>${song}</div>
                            <div>Arfina</div>
                        </div>
                        <div class="playnow">
                            <span style="font-size:21px;">Play Now</span>
                            <img width="40" class="invert" src="playbar.svg" alt="">
                        </div>
                    </li>`;
            }






            
    play.addEventListener("click", ()=>{
        if(currentsong.paused){
            currentsong.play()
            play.src="pause.svg"
        }else{
            currentsong.pause()
            play.src="playbar.svg"
        }
    })

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            const songName = e.querySelector(".info").firstElementChild.innerHTML.trim();
            console.log("Song Name:", songName);
            playMusic(songName);
        });
    });
});
});


    currentsong.addEventListener("timeupdate",()=>{
        console.log(currentsong.currentTime, currentsong.duration)
        document.querySelector(".songtime").innerHTML=`${formatTime(currentsong.currentTime)}/${formatTime(currentsong.duration)}`
        document.querySelector(".circle").style.left=(currentsong.currentTime/ currentsong.duration) * 100 + "%" ;
    
    })

    document.querySelector(".seekbar").addEventListener("click", e=>{
       let percent= (e.offsetX/e.target.getBoundingClientRect().width) * 100
      document.querySelector(".circle").style.left= percent + "%"
      currentsong.currentTime =((currentsong.duration) * percent)/100
    })
  prev.addEventListener("click", ()=>{
    console.log("prev")
    let index=songs.indexOf(currentsong.src.split("/").slice(-1)[0])
    
    console.log(songs, index)
    if([index-1] >= length){
    playMusic(songs[index-1])
    }
  })
  next.addEventListener("click", ()=>{
    currentsong.pause()
    console.log("next")
    let index=songs.indexOf(currentsong.src.split("/").slice(-1)[0])
    console.log(songs, index)
    if([index+1] >= songs.length){
    playMusic(songs[index+1])
    }
  })
  document.querySelector(".range input").addEventListener("change", (e) => {
    console.log(e.target, e.target.value);
    currentsong.volume=parseInt(e.target.value)/100
});

Array.from(document.getElementsByClassName("card")).forEach(e=>{
    e.addEventListener("click",async item=>{
        console.log(item.currentTarget.dataset)
        songs = await getsongs(`/songs/${    item.currentTarget.dataset.folder}`);
    
    })
})

}

main();
