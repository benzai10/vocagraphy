defmodule Vocagraphy.VideoTest do
  use Vocagraphy.ModelCase

  alias Vocagraphy.Video

  @valid_attrs %{category_id: 1, title: "some content", url: "some content"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = Video.changeset(%Video{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = Video.changeset(%Video{}, @invalid_attrs)
    refute changeset.valid?
  end
end
