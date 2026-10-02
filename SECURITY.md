# 🔒 Guia de Segurança do Projeto

## Regras básicas

1. **Nunca rode `npm install` de repositórios desconhecidos sem inspecionar os ganchos de ciclo de vida** (`preinstall`, `postinstall`, `prepare`, `preprepare`) em todos os `package.json` do projeto.
2. Prefira `npm install --ignore-scripts` e construa/valide conforme a necessidade (binários nativos como `esbuild` e `@swc/core` funcionam sem scripts).
3. Mantenha `.npmrc` com `ignore-scripts=true` neste repo como camada extra.
4. Ao clonar de terceiros, execute uma varredura por payloads ocultos em Unicode (variation selectors U+FE00–U+FE0F e U+E0100–U+E01EF) — é a técnica usada para esconder código dentro de `preinstall.js`.

## Como escanear o repo por código oculto

```bash
python3 - <<'EOF'
import os
root = '.'  # rode na raiz do repo
for dirpath, dirnames, filenames in os.walk(root):
    dirnames[:] = [d for d in dirnames if d not in {'.git', 'node_modules', 'dist'}]
    for fn in filenames:
        p = os.path.join(dirpath, fn)
        try:
            data = open(p, encoding='utf-8', errors='ignore').read()
        except Exception:
            continue
        n = sum(1 for ch in data if 0xFE00 <= ord(ch) <= 0xFE0F or 0xE0100 <= ord(ch) <= 0xE01EF)
        if n > 20:
            print(n, p)
EOF
```

> Quando arquivos legítimos usam emojis (✈️), eles possuem *um* variation selector por emoji. Densidade alta (centenas) em um arquivo `.js` é alarme vermelho.

## Histórico de incidentes

- [2025-10-02 — Código malicioso oculto em `preinstall.js` (C2 via Solana)](docs/security/INCIDENTE_PREINSTALL_MALWARE.md)
