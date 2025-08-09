import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Flip Safe',
  description: 'Login to your Flip Safe trading account',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}