console.log("starts");
let currentsong = new Audio();
let songs;
let currfolder;

function sectomins(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const mins=Math.floor(seconds/60);
    const resecs=Math.floor(seconds % 60);
    
    const fmin= String(mins).padStart(2, '0');
    const fsec= String(resecs).padStart(2, '0');

    return `${fmin}:${fsec}`;
}




async function getsongs(folder){
    currfolder=folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML= response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
            
        }
        
    }

    let songul = document.querySelector(".sidebar").getElementsByTagName("ul")[0]
    songul.innerHTML= ""
    for (const song of songs) {
        songul.innerHTML= songul.innerHTML + `<li><img src="music.svg" alt="">
        <span>${song}</span> <img class="plays" src="play.svg" alt=""></li>`;  
    }

    //eventlistener
    Array.from(document.querySelector("ul").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element=>{
            playmusic(e.querySelector("span").innerHTML)
            play.src="pause.svg"
            document.querySelector(".seekbar").style.visibility= "visible";
            
        })
    })
}

const playmusic = (track , pause=false)=>{
    //let audio = new Audio("/poems/" + track)//
    currentsong.src = `/${currfolder}/` + track
    if(!pause){
    currentsong.play()
    play.src="pause.svg"
} 
    document.querySelector(".songinfo").innerHTML= track
    document.querySelector(".tstamp").innerHTML="0:00/0:00"
}

async function displayalbums(){
    let a = await fetch("http://127.0.0.1:3000/poems/")
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML= response;
   let ancs = div.getElementsByTagName("a")

   let cardcontainer = document.querySelector(".cardcontainer")
   let array = Array.from(ancs)
   for (let index = 0; index < array.length; index++) {
    const e = array[index];
    
    if(e.href.includes("/poems")){
        let folder = e.href.split("/").slice(-2)[0] 
        // get metadata
        let a = await fetch(`http://127.0.0.1:3000/poems/${folder}/info.json`)
        let response = await a.json();
        console.log(response)
        cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="cards"><img class="songpic" src="/poems/${folder}/cover.jpg" alt=""><img class="playbtn" src="plbtn.svg" alt=""><h3>${response.title}</h3><p>${response.desc}</p></div>`
    }
   }

   //load playlist

    Array.from(document.getElementsByClassName("cards")).forEach(e=>{
        e.addEventListener("click", async item=>{
            songs = await getsongs(`poems/${item.currentTarget.dataset.folder}`)

        })
    })


}

async function main(){
    await getsongs("poems/naats")
    playmusic(songs[0],true)

    //display albums
    displayalbums()

    
    // attach eventlistener to play ,pre ,for
    play.addEventListener("click", ()=>{
        if(currentsong.paused){
            currentsong.play()
            play.src= "pause.svg"
            document.querySelector(".seekbar").style.visibility= "visible";
        }
        else{
            currentsong.pause()
            play.src = "play.svg"
        }
    })

    //timeupdate
    currentsong.addEventListener("timeupdate", ()=>{
        document.querySelector(".tstamp").innerHTML = `${sectomins(currentsong.currentTime)} / ${sectomins(currentsong.duration)}`
        document.querySelector(".pointer").style.left = (currentsong.currentTime/currentsong.duration)*100 + "%";
    })

    // add eventlistener to seekbar(6,75)
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let prcnt = (e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".pointer").style.left = prcnt  + "%";
        currentsong.currentTime= (currentsong.duration*prcnt)/100;
})


    document.querySelector(".logo").addEventListener("click",()=>{
        document.querySelector(".sidebar").style.left=0
        cross.src = "cross.svg"
    })

    document.querySelector(".cut").addEventListener("click",()=>{
        document.querySelector(".sidebar").style.left= -100 + "%"
    })


    //add event listener to next,pre
    pre.addEventListener("click",()=>{
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index-1) >= 0){
        playmusic(songs[index - 1])}
    })

    fore.addEventListener("click",()=>{
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index+1) < songs.length){
        playmusic(songs[index + 1])}

    })

    //eventlistener
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currentsong.volume=parseInt(e.target.value)/100
    })


    //mute listener

    document.querySelector(".vol").addEventListener("click",e=>{
        if(e.target.src.includes("sound.svg")){
            e.target.src = e.target.src.replace("sound.svg","mute.svg")
            currentsong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","sound.svg")
            currentsong.volume= 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value= 10;
        }

    })
}

main()
