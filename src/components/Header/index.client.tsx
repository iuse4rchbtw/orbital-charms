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
  const menu = header.navItems || []
  const pathname = usePathname()
  const { status } = useAuth()
  const loggedIn = status === 'loggedIn'

  return (
    <div className="relative z-20 border-b">
      <nav className="flex items-center md:items-end justify-between container pt-2">
        <div className="block flex-none md:hidden">
          <Suspense fallback={null}>
            <MobileMenu menu={menu} />
          </Suspense>
        </div>
        <div className="flex w-full items-end justify-between">
          <div className="flex w-full items-end gap-6 md:w-1/3">
            <Link className="orbital-logo" href="/">
              <span className="orbital-logo-mark" aria-hidden="true">
                OC
              </span>
              <span>Orbital Charms</span>
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

          <div className="flex justify-end md:w-1/3 gap-4">
            <div className="hidden items-center md:flex">
              {loggedIn ? (
                <>
                  <Link className="navLink" href="/account">
                    Account
                  </Link>
                  <Link className="navLink" href="/logout">
                    Log out
                  </Link>
                </>
              ) : (
                <Link className="navLink" href="/login">
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
