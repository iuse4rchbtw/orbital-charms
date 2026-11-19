'use client'
import { CMSLink } from '@/components/Link'
import { Cart } from '@/components/Cart'
import { OpenCartButton } from '@/components/Cart/OpenCart'
import Link from 'next/link'
import React, { Suspense } from 'react'

import { MobileMenu } from './MobileMenu'
import type { Header } from 'src/payload-types'

import { usePathname } from 'next/navigation'
import { cn } from '@/utilities/cn'
import { useAuth } from '@/providers/Auth'

type Props = {
  header: Header
}

export function HeaderClient({ header }: Props) {
  const fallbackMenu: Header['navItems'] = [
    {
      id: 'customize',
      link: { type: 'custom', url: '/customize', label: 'Customizer', newTab: false },
    },
    {
      id: 'shop',
      link: { type: 'custom', url: '/shop', label: 'Shop', newTab: false },
    },
  ]
  const menu = header.navItems?.length ? header.navItems : fallbackMenu
  const pathname = usePathname()
  const { status } = useAuth()
  const loggedIn = status === 'loggedIn'

  return (
    <div className="relative z-20 border-b">
      <nav className="flex items-center justify-between container pt-2">
        <div className="block flex-none md:hidden">
          <Suspense fallback={null}>
            <MobileMenu menu={menu} />
          </Suspense>
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="flex w-full items-center gap-6 md:w-1/3">
            <Link className="orbital-logo" href="/">
              <img className="orbital-logo-image" src="/logo.png" alt="Orbital Charms" />
            </Link>
            {menu.length ? (
              <ul className="hidden gap-4 text-sm md:flex md:items-center">
                {menu.map((item) => (
                  <li key={item.id}>
                    <CMSLink
                      {...item.link}
                      size={'clear'}
                      className={cn('relative navLink', {
                        active:
                          item.link.url && item.link.url !== '/'
                            ? pathname.includes(item.link.url)
                            : false,
                      })}
                      appearance="nav"
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="flex items-center justify-end md:w-1/3 gap-4">
            <div className="hidden h-full items-center gap-4 md:flex">
              {loggedIn ? (
                <>
                  <Link className="navLink py-2" href="/account">
                    Account
                  </Link>
                  <Link className="navLink py-2" href="/logout">
                    Log out
                  </Link>
                </>
              ) : (
                <Link className="navLink py-2" href="/login">
                  Log in
                </Link>
              )}
            </div>
            <Suspense fallback={<OpenCartButton />}>
              <Cart />
            </Suspense>
          </div>
        </div>
      </nav>
    </div>
  )
}
