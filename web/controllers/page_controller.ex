defmodule Vocagraphy.PageController do
  use Vocagraphy.Web, :controller
  alias Vocagraphy.Video
  alias Vocagraphy.Annotation

  def index(conn, _params) do
    videos = Repo.all(Video, limit: 10)
    query = from a in Annotation,
      where: is_nil(a.video_id) == false
    annotations = Repo.all(query)
    render conn, "index.html", videos: videos, annotations: annotations
  end
end
