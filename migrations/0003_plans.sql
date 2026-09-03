-- Doctor-authored plans can exist before the patient claims the invite code.

alter table journeys alter column patient_user_id drop not null;

alter table journeys add column if not exists plan text not null default '{}';
