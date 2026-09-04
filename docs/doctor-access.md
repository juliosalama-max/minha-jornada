# Acesso profissional

Contas médicas não são criadas pela tela de entrada e não podem ser promovidas pelo endpoint público de seleção de papel.

## Como funciona

1. A pessoa cria/usa sua conta autenticada normalmente.
2. A administração identifica o `user_id` dessa conta.
3. O `user_id` é incluído em `doctor_authorizations` com `active = true`.
4. No próximo acesso, se ainda não existir um perfil de aplicação, o sistema cria o perfil `doctor` automaticamente.
5. Toda operação médica verifica novamente se a autorização continua ativa.

Perfis médicos que já existiam antes da migration `0009_doctor_authorizations.sql` são incluídos automaticamente na tabela de autorização para evitar perda de acesso durante a migração.

## Autorizar

A operação administrativa é equivalente a:

```sql
insert into doctor_authorizations (user_id, active, note)
values ('USER_ID', true, 'Autorização administrativa')
on conflict (user_id)
do update set
  active = true,
  revoked_at = null,
  note = excluded.note;
```

A aplicação comum não expõe esta operação.

## Revogar

```sql
update doctor_authorizations
set active = false,
    revoked_at = now()
where user_id = 'USER_ID';
```

A revogação passa a bloquear as operações médicas mesmo que o perfil ainda contenha `role = 'doctor'`.

## Regra de segurança

O campo `profiles.role` não é suficiente para conceder acesso profissional. O banco possui um trigger que impede criação/promoção de perfil médico sem autorização ativa, e o backend verifica a autorização novamente em cada operação médica.
