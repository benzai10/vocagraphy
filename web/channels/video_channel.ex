defmodule Vocagraphy.VideoChannel do
  use Vocagraphy.Web, :channel
  alias Vocagraphy.AnnotationView

  def join("videos:" <> video_id, params, socket) do
    last_seen_id = params["last_seen_id"] || 0
    video_id = String.to_integer(video_id)
    video = Repo.get!(Vocagraphy.Video, video_id)

    annotations = Repo.all(
           from a in assoc(video, :annotations),
         where: a.id > ^last_seen_id,
      order_by: [asc: a.at, asc: a.id],
         limit: 200,
       preload: [:user]
    )

    resp = %{annotations: Phoenix.View.render_many(annotations, AnnotationView,
                                                   "annotation.json")}
    {:ok, resp, assign(socket, :video_id, video_id)}
  end

  def handle_in("new_annotation", params, socket) do
    user = Vocagraphy.Repo.get(Vocagraphy.User, socket.assigns.user_id)

    changeset =
      user
      |> build_assoc(:annotations, video_id: socket.assigns.video_id)
      |> Vocagraphy.Annotation.changeset(params)

    case Repo.insert(changeset) do
      {:ok, annotation} ->
        broadcast! socket, "new_annotation", %{
          id: annotation.id,
          user: Vocagraphy.UserView.render("user.json", %{user: user}),
          body: annotation.body,
          at: annotation.at
        }
        {:reply, :ok, socket}

      {:error, changeset} ->
        {:reply, {:error, %{errors: changeset}}, socket}
    end
  end
end
