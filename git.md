# 🚀 Passo a Passo Git no Windows

Guia rápido para commitar e dar **push** de um código no GitHub pelo **terminal do Windows (CMD ou PowerShell)**.

---

## 1. Entrar na pasta do projeto
```bash
cd "C:\Users\Rodrigo\meu-projeto"
```

---

## 2. Verificar o status atual
Mostra arquivos modificados e não rastreados.
```bash
git status
```

---

## 3. Adicionar arquivos ao stage
- **Um arquivo específico**:
```bash
git add nome_do_arquivo.ext
```

- **Todos os arquivos modificados**:
```bash
git add .
```

---

## 4. Fazer o commit
Escreva uma mensagem curta e clara:
```bash
git commit -m "Descrição do que foi alterado"
```

---

## 5. Conferir o branch em que está
```bash
git branch
```
*(exemplo: `main` ou `develop`)*

---

## 6. Atualizar o repositório local (boa prática)
Antes de enviar, puxe atualizações do GitHub:
```bash
git pull origin main
```

---

## 7. Enviar alterações para o GitHub
```bash
git push origin main
```

---

## 🔑 Fluxo Resumido
```bash
git status
git add .
git commit -m "mensagem do commit"
git pull origin main
git push origin main
```
