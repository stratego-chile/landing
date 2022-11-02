import { FC, useEffect, useState, PropsWithChildren } from 'react'
import LayoutStyles from '@stratego/styles/modules/Layout.module.sass'
import { Col, Container, Row } from 'react-bootstrap'
import Head from 'next/head'
import { DEFAULT_PAGE_DESCRIPTION, DEFAULT_TITLE } from '@stratego/helpers/defaults.helpers'
import NavBar from '@stratego/components/shared/navbar'
import Footer from '@stratego/components/shared/footer'
import { getPageTitle } from '@stratego/helpers/text.helper'
import classNames from 'classnames'

export type LayoutProps = {
  pageTitle?: string
  pageDescription?: string
  useBasicGrid?: boolean
}

const Layout: FC<PropsWithChildren<LayoutProps>> = (props) => {

  const { pageTitle, pageDescription, useBasicGrid, children } = props

  const [title, setTitle] = useState<string>()
  const [description, setDescription] = useState<string>()

  useEffect(() => {
    setTitle(pageTitle ? getPageTitle(pageTitle) : DEFAULT_TITLE)
  }, [pageTitle])

  useEffect(() => {
    setDescription(pageDescription ? pageDescription : DEFAULT_PAGE_DESCRIPTION)
  }, [pageDescription])

  return (
    <div className={classNames(LayoutStyles.pageContainer)}>
      <Head>
        <title>{ title }</title>
        <meta name="description" content={ description } />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className={classNames(LayoutStyles.pageContent)}>
        {
          useBasicGrid ?
            <Container>
              <Row>
                <Col>
                  { children }
                </Col>
              </Row>
            </Container> :
            children
        }
      </div>
      <Footer />
    </div>
  )
}

export default Layout
