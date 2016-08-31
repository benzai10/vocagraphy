import Player from "./player"

let Video = {

  currentTimestamp: 0,
  scheduleTimer: 0,
  timerAnnotations: [],

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
    let msgInput     = document.getElementById("msg-input-front")
    let msgInputBack = document.getElementById("msg-input-back")
    let msgEditId    = document.getElementById("msg-edit-id")
    let msgEditAt    = document.getElementById("msg-edit-at")
    let msgEditFront = document.getElementById("msg-edit-front")
    let msgEditBack  = document.getElementById("msg-edit-back")
    let btnWord      = document.getElementById("msg-submit")
    let btnExp       = document.getElementById("msg-expression")
    let btnRequest   = document.getElementById("msg-request")
    let btnUpdate    = document.getElementById("msg-update")
    let vidChannel   = socket.channel("videos:" + videoId)

    let popContainer = document.getElementById("pop-container")
    let btnDelete    = document.getElementById("btn-ann-delete")
    let btnEdit      = document.getElementById("btn-pop-edit")
    let btnEditCancel = document.getElementById("msg-update-cancel")
    let tsBack       = document.getElementById("timestamp-back")
    let tsForward    = document.getElementById("timestamp-forward")
    let tsRepeat     = document.getElementById("timestamp-repeat")

    btnWord.addEventListener("click", e => {
      let payload = {type: "W", front: msgInput.value, back: msgInputBack.value, at: Player.getCurrentTime()}
      vidChannel.push("new_annotation", payload)
                .receive("error", e => console.log(e) )
      msgInput.value = ""
      msgInputBack.value = ""
    })

    btnExp.addEventListener("click", e => {
      let payload = {type: "E", front: msgInput.value, back: msgInputBack.value, at: Player.getCurrentTime()}
      vidChannel.push("new_annotation", payload)
                .receive("error", e => console.log(e) )
      msgInput.value = ""
      msgInputBack.value = ""
    })

    btnRequest.addEventListener("click", e => {
      let payload = {type: "R", front: msgInput.value, back: msgInputBack.value, at: Player.getCurrentTime()}
      vidChannel.push("new_annotation", payload)
                .receive("error", e => console.log(e) )
      msgInput.value = ""
      msgInputBack.value = ""
    })

    btnUpdate.addEventListener("click", e => {
      let payload = {
        id: msgEditId.value,
        at: msgEditAt.value,
        front: msgEditFront.value,
        back: msgEditBack.value
      }
      vidChannel.push("update_annotation", payload)
        .receive("error", e => console.log(e) )
      document.getElementById("pop-edit").className += " hidden"
      document.getElementById("pop-container").classList.remove("hidden")
      this.timerAnnotations.forEach( ann => {
        if (ann.id == payload.id) { ann.at = payload.at }
      })
      this.schedulePopMessages(popContainer, this.timerAnnotations, null)
    })

    btnEdit.addEventListener("click", e => {
      clearTimeout(this.scheduleTimer)
      document.getElementById("pop-edit").classList.remove("hidden")
      document.getElementById("pop-container").className += " hidden"
    })

    btnEditCancel.addEventListener("click", e => {
      document.getElementById("pop-edit").className += " hidden"
      document.getElementById("pop-container").classList.remove("hidden")
      this.schedulePopMessages(popContainer, this.timerAnnotations, null)
    })

    btnDelete.addEventListener("click", e => {
      clearTimeout(this.scheduleTimer)
      let payload = {
        id: msgEditId.value
      }
      vidChannel.push("delete_annotation", payload)
        .receive("error", e => console.log(e) )
    })

    msgContainer.addEventListener("click", e => {
      e.preventDefault()
      let seconds = e.target.getAttribute("data-seek") ||
                    e.target.parentNode.getAttribute("data-seek")
      if(!seconds){ return }

      this.currentTimestamp = seconds
      Player.seekTo(seconds)
    })

    popContainer.addEventListener("click", e => {
      e.preventDefault()
      let seconds = e.target.getAttribute("data-seek") ||
                    e.target.parentNode.getAttribute("data-seek")

      let payload = {
        at: msgEditAt.value,
        front: msgEditFront.value,
        back: msgEditBack.value
      }

      vidChannel.push("update_annotation", payload)
                .receive("error", e => console.log(e) )
      if(!payload || !seconds){ return }

      this.currentTimestamp = seconds
      Player.seekTo(seconds)
    })

    tsBack.addEventListener("click", e => {
      e.preventDefault()
      msgEditAt.value -= 1000
      Player.seekTo(msgEditAt.value)
    })

    tsForward.addEventListener("click", e => {
      e.preventDefault()
      msgEditAt.value -= -1000
      Player.seekTo(msgEditAt.value)
    })

    tsRepeat.addEventListener("click", e => {
      e.preventDefault()
      Player.seekTo(this.currentTimestamp)
    })

    vidChannel.on("new_annotation", (resp) => {
      vidChannel.params.last_seen_id = resp.id
      this.timerAnnotations.push(resp)
      this.schedulePopMessages(popContainer, this.timerAnnotations, null)
      this.renderAnnotation(msgContainer, resp)
      this.renderPopAnnotation(popContainer, resp)
    })

    vidChannel.on("update_annotation", (resp) => {
      vidChannel.params.last_seen_id = resp.id
      this.renderAnnotation(msgContainer, resp)
      this.renderPopAnnotation(popContainer, resp)
    })

    vidChannel.on("delete_annotation", (resp) => {
      console.log(resp.id)
      this.timerAnnotations = this.timerAnnotations.filter( ann => {
        return ann.id != resp.id
      })
      console.log(this.timerAnnotations)
      let deletedAnn = document.getElementById("ann-id-" + resp.id)
      deletedAnn.parentElement.removeChild(deletedAnn)
      if (popContainer.hasChildNodes()) {
        popContainer.removeChild(popContainer.childNodes[0])
        document.getElementById("btn-pop-edit").className += " hidden"
        document.getElementById("btn-ann-delete").className += " hidden"
      }
      this.schedulePopMessages(popContainer, this.timerAnnotations, null)
    })

    vidChannel.join()
      .receive("ok", resp => {
        let ids = resp.annotations.map(ann => ann.id)
        resp.annotations.forEach( ann => this.renderAnnotation(msgContainer, ann) )
        if(ids.length > 0){ vidChannel.params.last_seen_id = Math.max(...ids) }
        this.timerAnnotations = resp.annotations
        this.schedulePopMessages(popContainer, resp.annotations, null)
      })
      .receive("error", reason => console.log("join failed", reason) )
  },

  renderAnnotation(msgContainer, {id, type, user, front, back, at}){
    let template = document.getElementById("ann-id-" + id)

    if (!template) {
      template = document.createElement("div")
      template.setAttribute("id", "ann-id-" + id)
    }

    template.innerHTML = `
    <div class="media ann-entry">
      <div class="media-left">
        <div class="ann-type-${this.esc(type)}">${this.esc(type)}</div>
        <a href="#" data-seek="${this.esc(at)}">
          <p class="ann-at">[${this.formatTime(at)}]</p>
        </a>
      </div>
      <div class="media-body">
        <p class="ann-user">${this.esc(user.username)}</p>
        <p class="ann-body">${this.esc(front)}</p>
        <p class="ann-body">${this.esc(back)}</p>
      </div>
    </div>
    `
    msgContainer.appendChild(template)
    msgContainer.scrollTop = msgContainer.scrollHeight
  },

  renderPopAnnotation(popContainer, {type, user, front, back, at, id}){
    this.currentTimestamp = at
    if (popContainer.hasChildNodes()) {
      popContainer.removeChild(popContainer.childNodes[0])
      document.getElementById("btn-pop-edit").className += " hidden"
      document.getElementById("btn-ann-delete").className += " hidden"
    }
    let template = document.createElement("div")
    template.innerHTML = `
      <p class="created-by">
        ${this.esc(user.username)}
      </p>
      <p class="pop-front"><b>${this.esc(front)}</b></p>
      <p class="pop-back">${this.esc(back)}</p>
    `
    popContainer.appendChild(template)
    popContainer.scrollTop = popContainer.scrollHeight

    document.getElementById("btn-pop-edit").classList.remove("hidden")
    document.getElementById("btn-ann-delete").classList.remove("hidden")

    let msgEditId    = document.getElementById("msg-edit-id")
    let msgEditAt    = document.getElementById("msg-edit-at")
    let msgEditFront = document.getElementById("msg-edit-front")
    let msgEditBack  = document.getElementById("msg-edit-back")
    let curTimestamp = document.getElementById("current-timestamp-display")

    msgEditId.value = id
    msgEditAt.value = at
    msgEditFront.value = front
    msgEditBack.value = back
    curTimestamp.innerHTML = this.formatTime(at)
  },

  scheduleMessages(msgContainer, annotations){
    setTimeout(() => {
      let ctime = Player.getCurrentTime()
      let remaining = this.renderAtTime(annotations, ctime, msgContainer)
      this.scheduleMessages(msgContainer, remaining)
    }, 1000)
  },

  schedulePopMessages(popContainer, annotations, lastPopAnnotation){
    this.scheduleTimer = setTimeout(() => {
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
