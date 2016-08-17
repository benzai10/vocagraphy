# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Vocagraphy.Repo.insert!(%Vocagraphy.SomeModel{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.
alias Vocagraphy.Repo
alias Vocagraphy.Category

for category <- ~w(Drama Music Comedy Show Movie News Lesson Other) do
    Repo.get_by(Category, name: category) ||
      Repo.insert!(%Category{name: category})
end
