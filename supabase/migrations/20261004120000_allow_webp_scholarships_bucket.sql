-- Permite image/webp en el bucket `scholarships` (error: "mime type image/webp is not supported").
update storage.buckets
set allowed_mime_types = (
  select array_agg(distinct t)
  from unnest(coalesce(allowed_mime_types, '{}') || array['image/jpeg', 'image/png', 'image/webp']) as t
)
where id = 'scholarships';
