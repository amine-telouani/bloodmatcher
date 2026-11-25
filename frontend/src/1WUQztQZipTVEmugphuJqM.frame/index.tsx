import Landing from '../animation/landing'

type Props = Partial<typeof args> & { onNavigate?: (path: string) => void }

export default function Home({ onNavigate }: Props) {
  const navigate = onNavigate ?? ((path: string) => {
    window.location.assign('/?screen=' + encodeURIComponent(path))
  })
  return <Landing onNavigate={navigate} />
}

export const args = {}
export const argTypes = {}
