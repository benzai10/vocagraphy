import Player from "./player"

let Video = {

  currentUser: 0,
  currentTimestamp: 0,
  currentAnnotation: {},
  repeatFlag: false,
  scheduleTimer: 0,
  displayTimer: {},
  timerAnnotations: [],

  init(socket, element){ if(!element){ return }
    console.log(element)
    let playerId = element.getAttribute("data-player-id")
    let videoId  = element.getAttribute("data-id")
    socket.connect()
    Player.init(element.id, playerId, () => {
      this.onReady(videoId, socket)
    })
  },

  onReady(videoId, socket){
    let msgContainer = document.getElementById("msg-container")
    let btnStudyMode = document.getElementById("switch-study-mode")
    let btnWatchMode = document.getElementById("switch-watch-mode")
    let msgInput     = document.getElementById("msg-input-front")
    let msgInputBack = document.getElementById("msg-input-back")
    let msgEditId    = document.getElementById("msg-edit-id")
    let msgEditAt    = document.getElementById("msg-edit-at")
    let msgEditFront = document.getElementById("msg-edit-front")
    let msgEditBack  = document.getElementById("msg-edit-back")
    let btnSave      = document.getElementById("msg-submit")
    /* let btnCancel    = document.getElementById("msg-cancel")*/
    let btnUpdate    = document.getElementById("msg-update")
    let vidChannel   = socket.channel("videos:" + videoId)

    let popContainer = document.getElementById("pop-container")
    let btnDelete    = document.getElementById("btn-ann-delete")
    let btnEdit      = document.getElementById("btn-pop-edit")
    let btnEditCancel = document.getElementById("msg-update-cancel")
    let tsBack       = document.getElementById("timestamp-back")
    let tsForward    = document.getElementById("timestamp-forward")
    let tsRepeat     = document.getElementById("timestamp-repeat")

    btnStudyMode.addEventListener("click", e => {
      document.getElementById("panel-add-annotation").className += " hidden"
      document.getElementById("panel-study-mode").classList.remove("hidden")
    })

    btnWatchMode.addEventListener("click", e => {
      document.getElementById("panel-study-mode").className += " hidden"
      document.getElementById("panel-add-annotation").classList.remove("hidden")
    })

    btnSave.addEventListener("click", e => {
      let payload = {front: msgInput.value, back: msgInputBack.value, at: Player.getCurrentTime()}
      vidChannel.push("new_annotation", payload)
                .receive("error", e => console.log(e) )
      msgInput.value = ""
      msgInputBack.value = ""
    })

    /* btnCancel.addEventListener("click", e => {
     *   msgInput.value = ""
     *   msgInputBack.value = ""
     * })
     */
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
        if (ann.id == payload.id) {
          ann.at = payload.at,
          ann.front = payload.front,
          ann.back = payload.back
        }
      })
      this.schedulePopMessages(popContainer, this.timerAnnotations, null)
    })

    btnEdit.addEventListener("click", e => {
      clearTimeout(this.displayTimer)
      document.getElementById("pop-edit").classList.remove("hidden")
      document.getElementById("overlay").classList.remove("hidden")
      document.getElementById("pop-container").className += " hidden"
    })

    btnEditCancel.addEventListener("click", e => {
      document.getElementById("pop-edit").className += " hidden"
      document.getElementById("overlay").className += " hidden"
      document.getElementById("pop-container").classList.remove("hidden")
      this.schedulePopMessages(popContainer, this.timerAnnotations, null)
    })

    btnDelete.addEventListener("click", e => {
      clearTimeout(this.displayTimer)
      let conf = confirm("Are you sure?")
      if (conf == true) {
        let payload = {
          id: msgEditId.value
        }
        this.timerAnnotations.filter( ann => {
          return ann.id != payload.id
        })
        vidChannel.push("delete_annotation", payload)
          .receive("error", e => console.log(e) )
      } else
      {
        return
      }
    })

    msgContainer.addEventListener("click", e => {
      e.preventDefault()
      clearTimeout(this.displayTimer)
      let seconds = e.target.getAttribute("data-seek") ||
                    e.target.parentNode.getAttribute("data-seek")
      if(!seconds){ return }

      /* this.currentTimestamp = seconds*/
      this.currentAnnotation = this.timerAnnotations.filter( ann => {
        return ann.at == seconds
      }).pop()
      this.repeatFlag = true
      Player.seekTo(seconds)
      this.renderPopAnnotation(popContainer, this.currentAnnotation)
      this.displayCurrentAnnotation(popContainer, this.timerAnnotations)
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
      this.repeatFlag = true
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

      // replace the ann in this.timerAnnotations and then sort it again
      // sort this.timerAnnotations
      // a.sort( (a,b) => {return (a.at > b.at) ? 1 : ((b.at > a.at) ? -1 : 0);});
      this.timerAnnotations = this.timerAnnotations.filter( ann => {
        return ann.id != resp.id
      })
      this.timerAnnotations.push(resp)
      this.timerAnnotations.sort( (a,b) => {return (a.at > b.at) ? 1 : ((b.at > a.at) ? -1 : 0);});
      let updatedAnn = document.getElementById("ann-id-" + resp.id)
      updatedAnn.innerHTML =
        `
        <div class="row ann-flashcards">
          <div class="col-sm-12">
            <a href="#" data-seek="${this.esc(resp.at)}">
              <span class="ann-at">[${this.formatTime(resp.at)}]</span>
            </a>
            <span class="ann-user">${this.esc(resp.user.username)}</span>
          </div>
          <div class="col-sm-6 ann-flashcard">
            <div class="thumbnail nav-thumbnail-front">
              <p class="ann-body">${this.esc(resp.front)}</p>
            </div>
          </div>
          <div class="col-sm-6 ann-flashcard">
            <div class="thumbnail nav-thumbnail-back">
              <p class="ann-body">${this.esc(resp.back)}</p>
            </div>
          </div>
        </div>
        `

      /* this.renderAnnotation(msgContainer, resp)*/
      this.renderPopAnnotation(popContainer, resp)
      document.getElementById("overlay").className += " hidden"
    })

    vidChannel.on("delete_annotation", (resp) => {
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
        this.current_user = resp.current_user
        let ids = resp.annotations.map(ann => ann.id)
        resp.annotations.forEach( ann => this.renderAnnotation(msgContainer, ann) )
        if(ids.length > 0){ vidChannel.params.last_seen_id = Math.max(...ids) }
        this.timerAnnotations = resp.annotations
        /* this.schedulePopMessages(popContainer, resp.annotations, null)*/
        this.displayCurrentAnnotation(popContainer, resp.annotations)
        console.log(this.current_user)
      })
      .receive("error", reason => console.log("join failed", reason) )
  },

  renderAnnotation(msgContainer, {id, user, front, back, at}){
    let template = document.getElementById("ann-id-" + id)

    if (!template) {
      template = document.createElement("div")
      template.setAttribute("id", "ann-id-" + id)
    }

    template.innerHTML = `
    <div class="row ann-flashcards">
      <div class="col-sm-12">
        <a href="#" data-seek="${this.esc(at)}">
          <span class="ann-at">[${this.formatTime(at)}]</span>
        </a>
        <span class="ann-user">${this.esc(user.username)}</span>
      </div>
      <div class="col-sm-6 ann-flashcard">
        <div class="thumbnail nav-thumbnail-front">
          <p class="ann-body">${this.esc(front)}</p>
        </div>
      </div>
      <div class="col-sm-6 ann-flashcard">
        <div class="thumbnail nav-thumbnail-back">
          <p class="ann-body">${this.esc(back)}</p>
        </div>
      </div>
    </div>
    `
    msgContainer.appendChild(template)
  },

  displayCurrentAnnotation(popContainer, annotations) {
    this.displayTimer = setTimeout(() => {
      let ctime = Player.getCurrentTime()
      if (this.currentTimestamp > ctime) {
        if (popContainer.hasChildNodes()) {
          popContainer.removeChild(popContainer.childNodes[0])
          document.getElementById("btn-pop-edit").className += " hidden"
          document.getElementById("btn-ann-delete").className += " hidden"
        }
      }
      this.currentAnnotation = annotations.filter( ann => {
        return ann.at < ctime
      }).pop()
      if ( !this.currentAnnotation > 0 || this.repeatFlag == true ) {
        this.displayCurrentAnnotation(popContainer, annotations)
        this.repeatFlag = false
      } else {
        this.renderPopAnnotation(popContainer, this.currentAnnotation)
        this.displayCurrentAnnotation(popContainer, annotations)
      }
    }, 1000)
  },

  renderPopAnnotation(popContainer, {user, front, back, at, id}){
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
      <div class="row">
        <div class="col-sm-6">
          <div class="thumbnail thumbnail-flashcard">
            <p class="pop-front"><b>${this.esc(front)}</b></p>
          </div>
        </div>
        <div class="col-sm-6">
          <div class="thumbnail thumbnail-flashcard">
            <p class="pop-back">${this.esc(back)}</p>
          </div>
        </div>
      </div>
    `
    popContainer.appendChild(template)
    popContainer.scrollTop = popContainer.scrollHeight

    if (this.current_user == user.id) {
      document.getElementById("btn-pop-edit").classList.remove("hidden")
      document.getElementById("btn-ann-delete").classList.remove("hidden")
    }

    let msgEditId    = document.getElementById("msg-edit-id")
    let msgEditAt    = document.getElementById("msg-edit-at")
    let msgEditFront = document.getElementById("msg-edit-front")
    let msgEditBack  = document.getElementById("msg-edit-back")
    let msgEditBy    = document.getElementById("edited-by")
    let curTimestamp = document.getElementById("current-timestamp-display")

    msgEditId.value = id
    msgEditAt.value = at
    msgEditFront.value = front
    msgEditBack.value = back
    msgEditBy.innerHTML = `${this.esc(user.username)}`
    curTimestamp.innerHTML = this.formatTime(at)

    /* let msgContainer = document.getElementById("msg-container")*/
    /* let curListElement = document.getElementById("ann-id-" +*/
    /* this.currentAnnotation.id)*/
    /* msgContainer.scrollTop = curListElement.offsetTop - 40*/
  },

  scheduleMessages(msgContainer, annotations){
    setTimeout(() => {
      let ctime = Player.getCurrentTime()
      let remaining = this.renderAtTime(annotations, ctime, msgContainer)
      this.scheduleMessages(msgContainer, remaining)
    }, 1000)
  },

  schedulePopMessages(popContainer, annotations, lastPopAnnotation){
    this.displayTimer = setTimeout(() => {
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
