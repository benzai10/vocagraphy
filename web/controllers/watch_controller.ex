defmodule Vocagraphy.WatchController do
  use Vocagraphy.Web, :controller
  alias Vocagraphy.Video

  def show(conn, %{"id" => id}) do
    video = Repo.get!(Video, id)
    render conn, "show.html", video: video
  end
end
