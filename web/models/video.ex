defmodule Vocagraphy.Video do
  use Vocagraphy.Web, :model

  schema "videos" do
    field :url, :string
    field :title, :string
    field :description, :string
    belongs_to :user, Vocagraphy.User
    belongs_to :category, Vocagraphy.Category

    timestamps
  end

  @required_fields ~w(url title)
  @optional_fields ~w(description)

  @doc """
  Creates a changeset based on the `model` and `params`.

  If no params are provided, an invalid changeset is returned
  with no validation performed.
  """
  def changeset(model, params \\ :empty) do
    model
    |> cast(params, @required_fields, @optional_fields)
    |> assoc_constraint(:category)
  end
end
