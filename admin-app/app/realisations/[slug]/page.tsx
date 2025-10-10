import LogoutButton from '../../../components/LogoutButton';
import { ProjectEditorClient } from '../../../components/ProjectEditorClient';

export default function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  return (
    <main>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Réalisation : {slug}</h1>
        <LogoutButton />
      </header>
      <ProjectEditorClient slug={slug} />
    </main>
  );
}
