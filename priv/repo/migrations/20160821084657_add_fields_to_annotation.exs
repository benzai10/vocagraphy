defmodule Vocagraphy.Repo.Migrations.AddFieldsToAnnotation do
  use Ecto.Migration

  def change do
    alter table(:annotations) do
      add :type, :string
      add :front, :string
      add :back, :string
    end
  end
end
