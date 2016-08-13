ExUnit.start

Mix.Task.run "ecto.create", ~w(-r Vocagraphy.Repo --quiet)
Mix.Task.run "ecto.migrate", ~w(-r Vocagraphy.Repo --quiet)
Ecto.Adapters.SQL.begin_test_transaction(Vocagraphy.Repo)

