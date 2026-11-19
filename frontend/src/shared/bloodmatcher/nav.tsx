import React, { createContext, useContext } from 'react'

type Nav = { go: (path: string) => void; params: Record<string, string | undefined> }

const NavContext = createContext<Nav>({ go: () => {}, params: {} })

/** Stands in for the router: hands every in-app navigation to the prototype. */
export function NavProvider({
  onNavigate,
  params = {},
  children,
}: {
  onNavigate?: ((path: string) => void) | undefined
  params?: Record<string, string | undefined>
  children: React.ReactNode
}) {
  return <NavContext.Provider value={{ go: (p) => onNavigate?.(p), params }}>{children}</NavContext.Provider>
}

export function useNavigate() {
  return useContext(NavContext).go
}

export function useParams() {
  return useContext(NavContext).params
}

export function Link({ to, onClick, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  const { go } = useContext(NavContext)
  return (
    <a
      href={to}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        e.preventDefault()
        go(to)
      }}
      {...rest}
    />
  )
}
