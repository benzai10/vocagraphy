defmodule Vocagraphy.AnnotationView do
  use Vocagraphy.Web, :view

  def render("annotation.json", %{annotation: ann}) do
    %{
      id: ann.id,
      body: ann.body,
      at: ann.at,
      user: render_one(ann.user, Vocagraphy.UserView, "user.json")
    }
  end
end
