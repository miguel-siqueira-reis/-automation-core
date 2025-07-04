
# 📚 Puppeteer Automation Helper - Documentação

## 📦 Instalação

```bash
npm install @automation/core
```

---

## 🔍 Visão Geral

Classe utilitária para automação com Puppeteer que oferece:

- Configurações pré-definidas para navegação
- Métodos simplificados para interações comuns
- Gerenciamento de múltiplas páginas e abas
- Suporte a controle de downloads e manipulação de tempo
- Plugins stealth, timezone e idioma brasileiros

---

## 🧭 Métodos de Navegação

| Método | Descrição |
|--------|-----------|
| `open()` | Inicia o navegador com configurações padrão |
| `newPage()` | Abre uma nova aba no navegador |
| `goto(url, options)` | Navega para a URL desejada |
| `close()` | Encerra o navegador completamente |
| `closeVoidPages()` | Fecha abas em branco ou sem conteúdo |

**Exemplo:**
```javascript
await bot.open();
await bot.newPage();
await bot.goto('https://exemplo.com', { waitUntil: 'networkidle0', timeout: 30000 });
await bot.closeVoidPages();
```

---

## ✋ Métodos de Interação

| Método | Descrição |
|--------|-----------|
| `type(selector, value)` | Digita em um campo de input |
| `click(selector, verifyDisabled?)` | Clica em um elemento (espera estar habilitado, se `verifyDisabled` = true) |
| `select(selector, option)` | Seleciona opção em `<select>` padrão |
| `customSelect(selectorSelect, itemSelect, itemValue, options?)` | Seleciona opções em dropdowns customizados |

**Exemplo:**
```javascript
await bot.type('#usuario', 'admin');
await bot.click('#entrar', true);
await bot.select('#estado', 'SP');
await bot.customSelect('.dropdown', '.opcao', 'Opção 1');
```

---

## 🔎 Métodos de Busca

| Método | Descrição |
|--------|-----------|
| `get(selector, options?)` | Retorna elemento(s) com base no seletor |
| `getValue(selector, options?)` | Retorna texto ou valor de um elemento |
| `waitForElement(selector, text?, time?)` | Aguarda a presença de um elemento com (ou sem) texto específico |

**Exemplo:**
```javascript
const produto = await bot.get('.produto', { text: 'Tênis' });
const preco = await bot.getValue('.preco');
await bot.waitForElement('.sucesso', 'Concluído');
```

---

## ⚙️ Métodos de Configuração

| Método | Descrição |
|--------|-----------|
| `configDownload(path)` | Define o diretório de download |
| `setNewAgent()` | Altera o User-Agent da página |
| `time(ms)` | Aplica `multiplierTime` sobre valores de tempo |

**Exemplo:**
```javascript
bot.multiplierTime = 2; // Dobra todos os tempos
const espera = bot.time(1000); // 2000ms
```

---

## ⏳ Métodos de Tempo

| Método | Descrição |
|--------|-----------|
| `sleep(ms)` | Pausa a execução por X milissegundos |

**Exemplo:**
```javascript
await bot.sleep(3000); // 3 segundos
```

---

## 📝 Exemplo Completo

```javascript
const { Automation } = require('puppeteer-automation-helper');

(async () => {
  const bot = new Automation();

  try {
    bot.multiplierTime = 1.5;
    await bot.open();
    await bot.configDownload('./relatorios');

    await bot.goto('https://painel.exemplo.com/login');
    await bot.type('#usuario', 'admin');
    await bot.type('#senha', 'senha123');
    await bot.click('#btn-login', true);

    await bot.waitForElement('.dashboard');
    await bot.click('#relatorios');
    await bot.customSelect('#tipo-relatorio', '.opcao', 'Mensal');
    await bot.click('#gerar-relatorio');
    await bot.sleep(5000);

  } catch (error) {
    console.error('Erro durante execução:', error);
  } finally {
    await bot.close();
  }
})();
```

---

## 📌 Observações

- Todos os métodos respeitam o `multiplierTime`.
- Configurações automáticas:
  - Stealth Plugin
  - User-Agent aleatório
  - Idioma: Português (pt-BR)
  - Timezone: America/Sao_Paulo

---

## 🤝 Contribuições

Contribuições são bem-vindas! Abra uma *issue* ou envie um *Pull Request* no repositório.

---

## 📜 Licença

Licença [MIT](https://opensource.org/licenses/MIT)
