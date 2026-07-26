-- Remove the temporary family created by the production recommendation smoke test.
-- Keep application delete privileges unchanged; account/family deletion needs a
-- dedicated, audited server-side flow rather than a broad table grant.
delete from public.families
where name='Codex smoke test';
