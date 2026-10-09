# 0001 — Instalación de Impeccable (skills de diseño web)

**Fecha:** 2026-10-08

## Qué se hizo
Se instaló el paquete `impeccable@4.1.0` (engine v0.1.12, windows-x64) con `npx impeccable install`,
a nivel **proyecto**, para todas las herramientas de IA detectadas (Antigravity, Claude Code, Codex CLI, Gemini CLI).

## Por qué
Contar con skills, agentes y chequeos automáticos de diseño web para construir la web de Rosso Inmobiliaria.

## Archivos y carpetas creados
- `.claude/skills/impeccable/` — skill + ejecutable `scripts/bin/windows-x64/impeccable.exe`
- `.claude/agents/` — `impeccable-asset-producer`, `impeccable-documenter`, `impeccable-finish-reviewer`, `impeccable-manual-edit-applier`
- `.claude/settings.local.json` — hooks:
  - `SessionStart`: prepara la sesión (timeout 5 s)
  - `PostToolUse` (Edit|Write): chequeo rápido de archivos de UI (timeout 5 s)
  - `Stop`: revisión de diseño profunda (timeout 30 s)
- `.agent/skills/impeccable/`, `.agents/skills/impeccable/` (+ hooks en `.agents`), `.gemini/skills/impeccable/` — copias para Antigravity, Codex y Gemini

## Cómo se verificó
Salida del instalador sin errores ("Done!"); se listaron `.claude/agents`, `.claude/skills` y el contenido de `.claude/settings.local.json`.

## Pendientes
- Reiniciar la sesión de Claude Code para que cargue la skill, agentes y hooks.
- Ejecutar `/impeccable init` en el chat para configurar el contexto de diseño del proyecto.
