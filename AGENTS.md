<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Store the single exam plan and study progress in browser storage, preserving existing keys, because SemPlan is a browser-only planner with no account flow.
- Keep rewards and weekly-goal calculations in browser-safe library helpers and shared study controls in a dedicated component, so exam and free study use the same points rules.
