# Minha Jornada V2 — Especificação funcional

## Princípio do produto

A Jornada publicada pela médica é a fonte de verdade do aplicativo.

- A médica define o plano, módulos, frequência, tarefas, consultas, exames e orientações.
- O paciente registra apenas sua experiência e o cumprimento das ações que lhe foram atribuídas.
- O sistema organiza os dados sem substituir julgamento clínico.
- Nenhum módulo deve aparecer para um paciente apenas porque existe no produto.

## Papéis e autoria

### Médica
Pode criar e editar Jornada, consultas, tarefas, exames, medicações, metas, frequência e regras de acompanhamento.

### Paciente
Pode registrar sono, movimento, alimentação, sintomas, comportamento, uso realizado de medicação, completar tarefas e responder questionários.

A médica não altera silenciosamente dados autorreferidos pelo paciente. O paciente não altera prescrição ou estrutura da Jornada.

## Fluxo principal

1. Médica cria o paciente.
2. Médica cria a Jornada em rascunho.
3. Médica visualiza como paciente.
4. Médica publica.
5. Sistema gera convite/código.
6. Paciente acessa e vê apenas o plano publicado.
7. Registros do paciente alimentam visão longitudinal da médica.
8. Alterações posteriores criam nova versão da Jornada.

## Status da Jornada

- draft
- published
- in_review
- completed
- archived

Toda publicação deve gerar versão e preservar histórico.

## Estrutura futura da Jornada

- identificação do ciclo
- objetivo geral
- motivação/valores do paciente
- até 3 prioridades ativas
- módulos configuráveis
- consultas
- tarefas
- exames
- questionários
- medicamentos
- regras de alerta
- revisão

## Estrutura universal de módulo

Cada módulo deve poder definir:

- título
- ativo/inativo
- orientação ao paciente
- frequência
- dias específicos
- data de início
- data de término
- data de revisão
- obrigatório/opcional
- perguntas
- lógica condicional

Frequências:

- daily
- weekly
- selected_days
- monthly
- event_based
- one_time

## Tipos de perguntas

- sim/não
- escolha única
- múltipla escolha
- escala
- número
- duração
- texto curto
- texto longo
- emoção
- evento

## Módulos previstos

- Medicação
- Alimentação
- Movimento
- Sono
- CPAP
- Sintomas
- Comportamento alimentar
- Estresse/regulação emocional
- Conexões sociais
- Espiritualidade/valores/propósito
- Questionários
- Campo personalizado

## Acompanhamento de doces / comer emocional

Deve existir como módulo configurável, não como comportamento obrigatório de todos os pacientes.

Exemplo de registro diário por 30 dias:

**Quantas vezes consumiu doce hoje?**
- nenhuma
- 1–3 vezes
- mais de 3 vezes

Quando houver consumo, permitir opcionalmente:

- emoção/sensação antes
- fome antes
- contexto
- sensação depois
- percepção de perda de controle
- observação livre

Também deve poder ser configurado como `event_based`, para registrar somente quando o episódio ocorrer.

Objetivo: aumentar consciência sobre frequência, contexto e relação entre emoções e comportamento, evitando linguagem de julgamento.

## Método AGIR / acompanhamento longitudinal

O sistema deve comportar programas estruturados com:

- consultas médicas sequenciais
- consultas com nutricionista
- avaliações clínicas
- exames e tarefas
- acompanhamento de sono, alimentação, movimento e outros pilares
- revisão progressiva do plano
- fases de intensificação e manutenção

Esses elementos devem ser configuráveis por paciente. Não devem existir meses, exames, profissionais ou tarefas hardcoded.

## Templates clínicos

Templates funcionam apenas como ponto de partida:

- obesidade com farmacoterapia
- obesidade sem farmacoterapia
- diabetes/pré-diabetes
- menopausa
- tireoide
- SOP
- apneia/CPAP
- risco cardiometabólico
- doença hepática metabólica
- saúde muscular/funcional
- comer emocional/perda de controle
- manutenção
- personalizado vazio

Qualquer item do template pode ser removido ou alterado antes da publicação.

## Experiência médica V2

Ao abrir paciente:

- Visão geral
- Jornada
- Registros
- Evolução
- Pendências

### Visão geral
- Jornada ativa
- versão
- última atividade
- próxima consulta
- prioridades atuais
- resumo dos módulos
- tarefas/exames pendentes
- alertas

### Jornada
Editor completo do plano.

Ações:
- Salvar rascunho
- Visualizar como paciente
- Publicar
- Criar nova versão

### Registros
Somente leitura dos dados do paciente, com possibilidade de adicionar observação clínica separada.

### Evolução
Gráficos e resumos apenas dos módulos ativos.

### Pendências
Tarefas, consultas, exames e questionários.

## Experiência paciente V2

Navegação principal:

- Hoje
- Jornada
- Evolução
- Pendências

### Hoje
Mostrar somente o que está previsto para aquele dia.

### Jornada
Explicar foco, prioridades, módulos e próximos encontros.

### Evolução
Mostrar dados apenas dos módulos da Jornada.

### Pendências
Tarefas, consultas, exames e questionários.

## Regras de segurança

- conta médica não pode ser autodeclarada;
- backend valida papel e vínculo em todas as mutações;
- paciente não altera plano/prescrição;
- médica não sobrescreve registro autorreferido;
- sem hard delete de dados clínicos pelo usuário;
- toda alteração relevante deve ser auditável.

## P0 — saneamento imediato

1. bloquear autocriação de perfil médico;
2. tornar savePlan exclusivo da médica;
3. tornar consultas exclusivas da equipe;
4. limitar atualização de tarefa pelo paciente;
5. tornar DayLog e MonthNotes exclusivos do paciente;
6. remover reset destrutivo;
7. corrigir `walkMinutes/gym` vs `aerobic/strength`;
8. remover defaults específicos do primeiro paciente;
9. remover campos de prescrição do onboarding/perfil do paciente.

## P1 — motor da Jornada

- jornada vazia
- módulos dinâmicos
- frequência
- perguntas configuráveis
- lógica condicional
- rascunho
- preview
- publicação
- versionamento

## P2 — interfaces V2

- nova experiência médica
- Hoje dinâmico
- Evolução dinâmica
- Pendências
- templates

## P3 — inteligência operacional

- alertas configuráveis
- resumo pré-consulta
- relatórios de ciclo
- visão populacional da carteira

## Regra-mãe

> Jornada define. Paciente registra. Sistema organiza. Médica interpreta e ajusta.
