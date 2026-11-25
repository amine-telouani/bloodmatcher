import React, { createContext, forwardRef, useContext } from 'react'

/**
 * Callback-based navigation, mirroring the app's NavProvider/Link.
 * When imported into BloodMatcher, swap these imports for the existing NavProvider/Link —
 * the props (`to`, children, className) are the same, and the routes are unchanged.
 */
export type AppPath = '/' | '/login' | '/register' | '/donor' | '/hospital' | '/admin'

type Navigate = (to: AppPath) => void

const NavContext = createContext<Navigate>(() => {})

export function NavProvider({ navigate, children }: { navigate: Navigate; children: React.ReactNode }) {
  return <NavContext.Provider value={navigate}>{children}</NavContext.Provider>
}

export function useNavigate() {
  return useContext(NavContext)
}

type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: AppPath }

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ to, onClick, ...rest }, ref) {
  const navigate = useNavigate()
  return (
    <a
      ref={ref}
      href={to}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        e.preventDefault()
        navigate(to)
      }}
      {...rest}
    />
  )
})
