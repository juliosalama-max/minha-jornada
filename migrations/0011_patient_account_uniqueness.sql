-- A signed-in patient account represents one person in the application.
-- The original journeys.patient_user_id constraint already guaranteed this
-- before patients were separated from Journey cycles. Preserve that invariant
-- at the patient entity level.

create unique index if not exists patients_account_unique
  on patients (patient_user_id)
  where patient_user_id is not null;
