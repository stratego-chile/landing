import { ScanCommand } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { isSerializable, isSimilar } from '@stratego/helpers/assert.helper'
import { getDynamoCommandItems } from '@stratego/helpers/dynamo.helper'
import { defaultLocale } from '@stratego/locales'
import { checkCaptchaToken } from '@stratego/pages/api/(captcha)'
import endpoint from '@stratego/pages/api/(endpoint)'
import { StatusCodes } from 'http-status-codes'
import type { NextApiHandler } from 'next'

type SearchRequest = Exclusive<
  {
    searchCriteria: string
    default?: never
  },
  {
    searchCriteria?: never
    default: boolean
  }
>

const handle: NextApiHandler<
  Stratego.Common.ResponseBody<{
    foundArticles: Array<Stratego.Documentation.PostRef>
    defaultMode: boolean
  }>
> = async (...hooks) => {
  endpoint(['POST'], ...hooks, async (request, response) => {
    if (!isSerializable(request.body)) throw new TypeError('Wrong payload')

    const captchaToken = request.headers.authorization

    if (!captchaToken || !(await checkCaptchaToken(captchaToken)))
      throw new Error('Captcha token invalid')

    const searchRequest = request.body as Partial<SearchRequest>

    const locale = request.headers['accept-language'] as Stratego.Common.Locale

    if (!('searchCriteria' in searchRequest) && !('default' in searchRequest))
      throw new TypeError('"searchCriteria" or "default" is undefined')

    const { searchCriteria, default: isDefault } =
      searchRequest as SearchRequest

    const items = await getDynamoCommandItems(
      new ScanCommand({
        TableName: process.env.DOCS_DYNAMODB_TABLE,
      })
    )

    const docs: Array<Stratego.Documentation.Post> = (($items) => {
      if (
        $items.some(
          (item) =>
            typeof item === 'object' &&
            [''].every((expectedProp) => expectedProp in item)
        )
      )
        return []
      if (!isDefault) {
        const parsedCriteria = (searchCriteria ?? '').split(' ')

        return $items.filter(({ tags }) =>
          tags.some((tag) =>
            parsedCriteria.some((fragment) =>
              isSimilar(fragment.toLowerCase(), tag.toLowerCase())
            )
          )
        )
      }
      return $items.filter(({ type }) => type === 'default')
    })(
      (items ?? []).map(
        (item) => unmarshall(item) as Stratego.Documentation.Post
      )
    )

    response.status(StatusCodes.OK).json({
      status: 'OK',
      result: {
        foundArticles: docs
          ?.filter(({ availableLocales }) =>
            availableLocales.includes(locale ?? defaultLocale)
          )
          .map(({ refId, title, availableLocales }) => ({
            id: refId,
            title: title[locale] ?? title[defaultLocale]!,
            locale:
              availableLocales[
                availableLocales.indexOf(locale ?? defaultLocale)
              ],
          })),
        defaultMode: !!isDefault,
      },
    })
  })
}

export default handle
