import { capitalizeText } from '@stratego/helpers/text.helper'
import Link from 'next/link'
import { type FC } from 'react'
import { Container, Nav, Navbar } from 'react-bootstrap'

export type Links = Array<{
  href: string
  text: string
}>

type SubNavBarProps = {
  links?: Links
}

const SubNavBar: FC<SubNavBarProps> = ({ links }) => {
  return (
    <Navbar
      variant="light"
      bg="light"
      className="sticky-top shadow"
      expand="lg"
    >
      <Container className="px-lg-1">
        <Nav>
          {links?.map((link, key) => (
            <Link key={key} href={link.href} passHref legacyBehavior>
              <Nav.Link as="a">
                {capitalizeText(link.text.toLowerCase(), 'simple')}
              </Nav.Link>
            </Link>
          ))}
        </Nav>
      </Container>
    </Navbar>
  )
}

export default SubNavBar
