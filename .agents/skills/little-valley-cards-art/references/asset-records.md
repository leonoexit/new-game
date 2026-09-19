# Asset records

## Statuses

- `study`: explores one question and is not a continuity reference.
- `candidate`: promising enough for targeted iteration.
- `approved reference`: controls later identity, style, or location work.
- `runtime approved`: processed and verified for a specific game slot.
- `superseded`: retained for history but no longer controls new work.

## Storage

Use the existing project structure where available:

```text
art/
  style-studies/<study-id>/
  source/<asset-type>/
  processed/<asset-type>/
  approved/<asset-type>/
  prompts/
```

Never place a study in `approved/`. Never leave a project-referenced generation only in the tool's default output directory.

## Naming

Use stable subject IDs and a version:

```text
<subject-id>-<purpose>-v<major>.<minor>.<ext>
```

Do not use roster positions such as `npc-1` or assumptions such as `three-characters`.

## Generation record

Record beside the asset:

- purpose and status;
- generation date and tool/model;
- complete final prompt;
- reference inputs and their roles;
- source and delivery paths;
- transformations applied;
- what to keep;
- what must change;
- approval decision and approver when applicable.

If metadata such as seed or model version is unavailable, write `unavailable`; do not invent it.

