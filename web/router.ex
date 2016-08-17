defmodule Vocagraphy.Router do
  use Vocagraphy.Web, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug Vocagraphy.Auth, repo: Vocagraphy.Repo
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", Vocagraphy do
    pipe_through :browser # Use the default browser stack

    get "/", PageController, :index
		resources "/users", UserController, only: [:index, :show, :new, :create]
    resources "/sessions", SessionController, only: [:new, :create, :delete]
    get "/watch/:id", WatchController, :show
  end

  # Other scopes may use custom stacks.
  # scope "/api", Vocagraphy do
  #   pipe_through :api
  # end
  scope "/manage", Vocagraphy do
    pipe_through [:browser, :authenticate_user]
    resources "/videos", VideoController
  end
end
