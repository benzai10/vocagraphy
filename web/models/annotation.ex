defmodule Vocagraphy.Annotation do
  use Vocagraphy.Web, :model

  schema "annotations" do
    field :body, :string
    field :at, :integer
    field :front, :string
    field :back, :string
    field :type, :string
    belongs_to :user, Vocagraphy.User
    belongs_to :video, Vocagraphy.Video

    timestamps
  end

  @required_fields ~w(front type at)
  @optional_fields ~w(body back)

  @doc """
  Creates a changeset based on the `model` and `params`.

  If no params are provided, an invalid changeset is returned
  with no validation performed.
  """
  def changeset(model, params \\ :empty) do
    model
    |> cast(params, @required_fields, @optional_fields)
  end
end
