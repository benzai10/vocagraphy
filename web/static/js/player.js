let Player = {
  player: null,

  init(domId, playerId, onReady){
    window.onYouTubeIframeAPIReady = () => {
      this.onIframeReady(domId, playerId, onReady)
    }
    let youtubeScriptTag = document.createElement("script")
    youtubeScriptTag.src = "https://www.youtube.com/iframe_api"
    document.head.appendChild(youtubeScriptTag)
  },

  onIframeReady(domId, playerId, onReady){
    let startAtInMillisecs = document.getElementById(domId).dataset.startAt / 1000
    let startAt = startAtInMillisecs.toFixed()
    this.player = new YT.Player(domId, {
      height: "360",
      width: "640",
      videoId: playerId,
      playerVars: {
        autoplay: 0,
        start: startAt
      },
      events: {
        "onReady": (event => onReady(event) ),
        "onStateChange": (event => this.onPlayerStateChange(event) )
      }
    })
  },

  /* onPlayerReady(event) {*/
  /* event.target.playVideo()*/
  /* },*/

  onPlayerStateChange(event){ },
  getCurrentTime(){ return Math.floor(this.player.getCurrentTime() * 1000) },
  seekTo(millsec){ return this.player.seekTo(millsec / 1000) }
}
export default Player
