import { redirect } from 'next/navigation';

export default function KanbanPage() {
  redirect('/chamados?view=quadro');
}
