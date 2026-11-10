-- Permissões de acesso via API para as tabelas da plataforma.
-- As regras de linha (RLS) continuam decidindo o que cada pessoa vê e altera.

grant select on public.courses, public.modules, public.lessons to anon, authenticated;
grant insert, update, delete on public.courses, public.modules, public.lessons to authenticated;

grant select, insert, update, delete on public.lesson_contents, public.materials, public.enrollments to authenticated;
grant select, insert, delete on public.lesson_progress to authenticated;
grant select on public.purchases to authenticated;
grant select, update on public.profiles to authenticated;

-- Webhook da Kiwify (roda com a chave de serviço)
grant select, insert, update on public.purchases, public.enrollments to service_role;
grant select on public.courses, public.profiles to service_role;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.has_course_access(uuid) to anon, authenticated;
grant execute on function public.can_view_lesson(uuid) to anon, authenticated;
grant execute on function public.can_view_material(uuid) to authenticated;
