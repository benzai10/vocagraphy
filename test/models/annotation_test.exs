defmodule Vocagraphy.AnnotationTest do
  use Vocagraphy.ModelCase

  alias Vocagraphy.Annotation

  @valid_attrs %{type: "W", at: 42, front: "some content"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = Annotation.changeset(%Annotation{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = Annotation.changeset(%Annotation{}, @invalid_attrs)
    refute changeset.valid?
  end
end
