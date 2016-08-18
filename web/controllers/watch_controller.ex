defmodule Vocagraphy.WatchController do
  use Vocagraphy.Web, :controller
  alias Vocagraphy.Video

  def show(conn, %{"id" => id, "start_at" => start_at}) do
    video = Repo.get!(Video, id)
    render conn, "show.html", video: video, start_at: start_at
  end
end
