defmodule Vocagraphy.AnnotationView do
  use Vocagraphy.Web, :view

  def render("annotation.json", %{annotation: ann}) do
    %{
      id: ann.id,
      body: ann.body,
      front: ann.front,
      back: ann.back,
      type: ann.type,
      at: ann.at,
      user: render_one(ann.user, Vocagraphy.UserView, "user.json")
    }
  end
end
