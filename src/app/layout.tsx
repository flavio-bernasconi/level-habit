'use client'
import localFont from 'next/font/local'
import './globals.css'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { SignInButton, UserButton } from '@clerk/nextjs'
import { Authenticated, ConvexReactClient, Unauthenticated } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900'
})

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
)

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-100`}
      >
        <ClerkProvider
          publishableKey={
            'pk_test_c2hpbmluZy1ncm91c2UtNDMuY2xlcmsuYWNjb3VudHMuZGV2JA'
          }
        >
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <Unauthenticated>
              <SignInButton />
            </Unauthenticated>
            <Authenticated>
              <div className='container mx-auto p-4 max-sm:my-4'>
                <UserButton />
              </div>
              {children}
            </Authenticated>
          </ConvexProviderWithClerk>
        </ClerkProvider>
      </body>
    </html>
  )
}
