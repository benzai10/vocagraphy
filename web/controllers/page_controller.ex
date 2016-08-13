defmodule Vocagraphy.PageController do
  use Vocagraphy.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
