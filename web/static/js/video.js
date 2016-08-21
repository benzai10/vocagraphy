import Player from "./player"

let Video = {

  init(socket, element){ if(!element){ return }
    let playerId = element.getAttribute("data-player-id")
    let videoId  = element.getAttribute("data-id")
    socket.connect()
    Player.init(element.id, playerId, () => {
      this.onReady(videoId, socket)
    })
  },

  onReady(videoId, socket){
    let msgContainer = document.getElementById("msg-container")
    let msgInput     = document.getElementById("msg-input")
    let postButton   = document.getElementById("msg-submit")
    let vidChannel   = socket.channel("videos:" + videoId)

    let popContainer = document.getElementById("pop-container")

    postButton.addEventListener("click", e => {
      let payload = {body: msgInput.value, at: Player.getCurrentTime()}
      vidChannel.push("new_annotation", payload)
                .receive("error", e => console.log(e) )
      msgInput.value = ""
    })

    msgContainer.addEventListener("click", e => {
      e.preventDefault()
      let seconds = e.target.getAttribute("data-seek") ||
                    e.target.parentNode.getAttribute("data-seek")
      if(!seconds){ return }

      Player.seekTo(seconds)
    })

    popContainer.addEventListener("click", e => {
      e.preventDefault()
      let seconds = e.target.getAttribute("data-seek") ||
                    e.target.parentNode.getAttribute("data-seek")
      if(!seconds){ return }

      Player.seekTo(seconds)
    })

    vidChannel.on("new_annotation", (resp) => {
      vidChannel.params.last_seen_id = resp.id
      this.renderAnnotation(msgContainer, resp)
      this.renderPopAnnotation(popContainer, resp)
    })

    vidChannel.join()
      .receive("ok", resp => {
        let ids = resp.annotations.map(ann => ann.id)
        resp.annotations.forEach( ann => this.renderAnnotation(msgContainer, ann) )
        if(ids.length > 0){ vidChannel.params.last_seen_id = Math.max(...ids) }
        this.schedulePopMessages(popContainer, resp.annotations, null)
      })
      .receive("error", reason => console.log("join failed", reason) )
  },

  renderAnnotation(msgContainer, {user, body, at}){
    let template = document.createElement("div")
    template.innerHTML = `
    <a href="#" data-seek="${this.esc(at)}">
      [${this.formatTime(at)}]
      <b>${this.esc(user.username)}</b>: ${this.esc(body)}
    </a>
    `
    msgContainer.appendChild(template)
    msgContainer.scrollTop = msgContainer.scrollHeight
  },

  renderPopAnnotation(popContainer, {user, body, at}){
    if (popContainer.hasChildNodes()) {
      popContainer.removeChild(popContainer.childNodes[0])
    }
    let template = document.createElement("div")
    template.innerHTML = `
    <a href="#" data-seek="${this.esc(at)}">
      [${this.formatTime(at)}]
      <b>${this.esc(user.username)}</b>: ${this.esc(body)}
    </a>
    `
    popContainer.appendChild(template)
    popContainer.scrollTop = popContainer.scrollHeight
  },

  scheduleMessages(msgContainer, annotations){
    setTimeout(() => {
      let ctime = Player.getCurrentTime()
      let remaining = this.renderAtTime(annotations, ctime, msgContainer)
      this.scheduleMessages(msgContainer, remaining)
    }, 1000)
  },

  schedulePopMessages(popContainer, annotations, lastPopAnnotation){
    setTimeout(() => {
      let ctime = Player.getCurrentTime()
      let currentPopArray = annotations.filter( ann => {
        return ann.at < ctime
      })
      let currentPopAnnotation = currentPopArray[currentPopArray.length - 1]
      if (currentPopAnnotation != null && currentPopAnnotation != lastPopAnnotation) {
        this.renderPopAnnotation(popContainer, currentPopAnnotation)
      }
      this.schedulePopMessages(popContainer, annotations, currentPopAnnotation)
    }, 1000)
  },

  renderAtTime(annotations, seconds, msgContainer){
    return annotations.filter( ann => {
      if(ann.at > seconds){
        return true
      } else {
        this.renderAnnotation(msgContainer, ann)
        return false
      }
    })
  },

  renderPopAtTime(annotations, seconds, popContainer){
    return annotations.filter( ann => {
      if(ann.at > seconds){
        return true
      } else {
        this.renderPopAnnotation(popContainer, ann)
        return false
      }
    })
  },

  formatTime(at){
    let date = new Date(null)
    date.setSeconds(at / 1000)
    return date.toISOString().substr(14, 5)
  },

  esc(str){
    let div = document.createElement("div")
    div.appendChild(document.createTextNode(str))
    return div.innerHTML
  }
}
export default Video
