defmodule Vocagraphy.VideoViewTest do
  use Vocagraphy.ConnCase, async: true
  import Phoenix.View

  test "renders index.html", %{conn: conn} do
    videos = [%Vocagraphy.Video{id: "1", title: "dogs", url: "http://youtube.com/watch?v=1234"},
              %Vocagraphy.Video{id: "2", title: "cats", url: "http://youtube.com/watch?v=1234"}]
    content = render_to_string(Vocagraphy.VideoView, "index.html", conn: conn, videos: videos)

    assert String.contains?(content, "My Videos")
    for video <- videos do
      assert String.contains?(content, video.title)
    end
  end

  test "renders new.html", %{conn: conn} do
    changeset = Vocagraphy.Video.changeset(%Vocagraphy.Video{})
    categories = [{"cats", 123}]

    content = render_to_string(Vocagraphy.VideoView, "new.html", conn: conn, changeset: changeset, categories: categories)

    assert String.contains?(content, "New video")
  end
end
