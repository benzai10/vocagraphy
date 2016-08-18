defmodule Vocagraphy.PageController do
  use Vocagraphy.Web, :controller
  alias Vocagraphy.Video
  alias Vocagraphy.Annotation

  def index(conn, _params) do
    videos = Repo.all(Video, limit: 10)
    annotations = Repo.all(Annotation, limit: 10)
    render conn, "index.html", videos: videos, annotations: annotations
  end
end
