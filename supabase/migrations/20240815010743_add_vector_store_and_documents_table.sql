create extension vector;

create table public.call_logs (
  id uuid not null default gen_random_uuid(),
  content text,
  metadata jsonb,
  embedding vector(1536) -- 1536 works for OpenAI embeddings
);

create function match_call_logs (
  query_embedding vector(1536),
  match_count int DEFAULT null,
  filter jsonb DEFAULT '{}'
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  embedding jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    id,
    content,
    metadata,
    (embedding::text)::jsonb as embedding,
    1 - (call_logs.embedding <=> query_embedding) as similarity
  from call_logs
  where metadata @> filter
  order by call_logs.embedding <=> query_embedding
  limit match_count;
end;
$$;