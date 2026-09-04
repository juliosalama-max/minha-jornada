# Minha Jornada V2 — Checklist de deploy e rollback

## Objetivo

Este checklist deve ser usado antes e depois do merge da V2 em produção.

A V2 foi estruturada para preservar os dados existentes e manter compatibilidade temporária com a aplicação anterior durante o rollout.

## Antes do merge

- [ ] PR consolidado contra `main` sem commits pendentes da base.
- [ ] TypeScript verde.
- [ ] Testes da Journey V2 verdes.
- [ ] Testes de segurança verdes.
- [ ] Smoke test executando todas as migrations em banco vazio verde.
- [ ] Suíte legada verde.
- [ ] Build de desenvolvimento verde.
- [ ] Confirmar que nenhum módulo clínico universal foi reintroduzido fora da Jornada.
- [ ] Confirmar que paciente não pode criar/promover conta médica.
- [ ] Confirmar que ciclos concluídos/arquivados permanecem somente leitura.

## Banco de dados

Antes de implantar em produção:

- [ ] Confirmar que `DATABASE_URL` aponta para o banco correto.
- [ ] Criar snapshot/backup do banco antes do deploy.
- [ ] Registrar o horário do snapshot.
- [ ] Não apagar migrations já aplicadas da tabela `_migrations`.
- [ ] Não executar migrations destrutivas manualmente.

Migrations novas da V2:

- `0005_journey_versions.sql`
- `0006_journey_module_responses.sql`
- `0007_journey_action_progress.sql`
- `0008_doctor_alerts.sql`
- `0009_doctor_authorizations.sql`
- `0010_patients_and_journey_cycles.sql`
- `0011_patient_account_uniqueness.sql`
- `0012_rollout_compatibility.sql`

### Compatibilidade durante o rollout

As migrations incluem proteção para o intervalo em que o banco novo já foi migrado, mas instâncias da aplicação anterior ainda podem estar atendendo requisições.

Nesse intervalo:

- jornadas criadas pela aplicação antiga recebem automaticamente os campos mínimos da V2;
- inserts antigos recebem `patient_id`;
- vínculo antigo por `patient_user_id` é sincronizado com `patients`;
- uma Jornada criada explicitamente como rascunho pela V2 permanece rascunho;
- a versão inicial é preservada para inserts legados.

## Verificação funcional após deploy

### Acesso médico

- [ ] Conta médica autorizada entra normalmente.
- [ ] Conta sem autorização não consegue acessar funções médicas.
- [ ] Abrir painel de pacientes.
- [ ] Buscar paciente pelo nome.
- [ ] Testar filtros: Ativos, Rascunhos, Atenção, Aguardando entrada e Encerrados.
- [ ] Abrir um paciente existente.

### Criar paciente e Jornada

- [ ] Criar paciente de teste.
- [ ] Confirmar que a primeira Jornada nasce como rascunho.
- [ ] Confirmar que o paciente não consegue acessar o rascunho.
- [ ] Adicionar pelo menos dois módulos diferentes.
- [ ] Configurar frequências diferentes.
- [ ] Adicionar uma pergunta condicional.
- [ ] Adicionar tarefa ou exame.
- [ ] Visualizar como paciente.
- [ ] Publicar.
- [ ] Confirmar incremento de versão.

### Acesso do paciente

- [ ] Entrar com o código publicado.
- [ ] Confirmar que aparecem somente os módulos publicados.
- [ ] Confirmar que módulos não selecionados não aparecem.
- [ ] Preencher um registro em Hoje.
- [ ] Confirmar que o registro aparece em Evolução.
- [ ] Confirmar que a médica vê o registro como “Informado pelo paciente”.
- [ ] Confirmar que a médica não consegue substituir o conteúdo original do registro.

### Alertas

- [ ] Configurar uma regra de alerta em módulo de teste.
- [ ] Enviar resposta que satisfaça a regra.
- [ ] Confirmar criação do alerta para a médica.
- [ ] Marcar alerta como lido.
- [ ] Confirmar atualização do painel populacional.

### Pendências

- [ ] Paciente marcar tarefa como concluída.
- [ ] Paciente informar agendamento de exame.
- [ ] Confirmar atualização na visão médica.
- [ ] Confirmar que paciente não pode alterar definição da tarefa/exame.

### Ciclos

- [ ] Concluir uma Jornada publicada.
- [ ] Confirmar que novos registros são bloqueados no ciclo concluído.
- [ ] Confirmar que histórico e Evolução continuam visíveis.
- [ ] Criar nova Jornada para o mesmo paciente.
- [ ] Confirmar que a nova Jornada nasce vazia.
- [ ] Confirmar que o ciclo anterior continua intacto.
- [ ] Confirmar que apenas um ciclo fica ativo.

## Dados existentes

Após deploy:

- [ ] Abrir paciente criado antes da V2.
- [ ] Confirmar que os dados legados continuam acessíveis.
- [ ] Confirmar que a Jornada legada foi preservada como versão publicada.
- [ ] Confirmar que caminhada/força e demais estatísticas legadas continuam legíveis.
- [ ] Não converter ou apagar registros antigos manualmente.

## Monitoramento imediato

Nas primeiras verificações após o deploy:

- [ ] Observar erros de migration.
- [ ] Observar erros 401/403 inesperados.
- [ ] Observar falhas ao carregar paciente/Jornada.
- [ ] Observar erros de constraint em `patients` ou `journeys`.
- [ ] Observar falhas ao salvar `journey_module_responses`.
- [ ] Observar duplicação inesperada de alertas.
- [ ] Observar pacientes sem Jornada ativa após publicação.

## Rollback da aplicação

Se for necessário voltar temporariamente para a aplicação anterior:

1. Reverter o código/deployment da aplicação.
2. **Não reverter nem apagar as migrations do banco.**
3. Manter as tabelas e colunas V2.
4. Os triggers de compatibilidade devem permitir que a aplicação anterior continue criando/vinculando jornadas.
5. Não excluir `patients`, `journey_versions` ou outros dados V2.
6. Registrar o incidente e a versão que foi revertida.
7. Corrigir o código em nova branch e testar novamente antes de um novo deploy.

## Rollback de dados

Rollback destrutivo de schema não deve ser a primeira resposta a um problema de aplicação.

Se houver suspeita de corrupção de dados:

- interromper novas alterações se necessário;
- preservar logs;
- comparar com o snapshot pré-deploy;
- restaurar banco somente após confirmar que a restauração é necessária;
- nunca executar `DROP TABLE` ou limpeza ampla como tentativa de correção rápida.

## Critério para liberar a V2

A versão pode ser considerada tecnicamente pronta para merge quando:

- CI consolidado estiver totalmente verde;
- smoke test de migrations estiver verde;
- `main` não tiver divergido da branch de integração;
- checklist funcional estiver preparado;
- houver snapshot do banco antes do deploy.

O merge da V2 e o deploy em produção são etapas separadas da implementação e devem ser deliberados.


## Preview Vercel

A validação funcional final deve ser executada em um deployment Vercel gerado a partir da branch `release/v2-integration-final`, nunca no deployment da `main`.

Antes de iniciar os testes:
- confirmar no GitHub/Vercel que o deployment aponta para o SHA atual da branch de integração;
- usar banco isolado ou PGlite temporário, nunca `DATABASE_URL` de produção;
- não associar o domínio de produção ao preview;
- registrar o URL de preview usado no teste funcional.


### Estado do banco de preview

- Banco de preview configurado em Neon: `minha-jornada-v2-preview-db`.
- A variável `DATABASE_URL` deve existir somente no ambiente Preview da Vercel.
- O deploy da branch `release/v2-integration-final` deve confirmar o migrador como `up to date` antes do teste funcional.
