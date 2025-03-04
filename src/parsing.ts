/** A collection of parsing codecs */
import { array, Codec, date, record, string, unknown } from 'purify-ts/Codec'
import { Left, Right } from 'purify-ts/Either'

export const ensureArray = <T>(tag: string, codec: Codec<T>): Codec<T[]> => {
  const schema = codec.schema()

  return Codec.custom({
    decode: (x) => {
      if (x === '') {
        return Right([])
      }

      return record(string, unknown)
        .decode(x)
        .chain((object) => {
          const possiblyElements = object[tag]
          const elements = Array.isArray(possiblyElements) ? possiblyElements : [possiblyElements]

          return array(codec).decode(elements)
        })
    },
    encode: (x) => x,
    schema: () => ({
      oneOf: [
        schema,
        { type: 'array', items: [schema], minItems: 1 },
        { type: 'string', enum: [''] },
      ],
    }),
  })
}

/** If a string is a valid number it will be parsed as such by our xml parser, even though it should still be a string */
export const ensureString = Codec.custom({
  decode: (x) =>
    string.decode(x).chainLeft((error) => (typeof x === 'number' ? Right(String(x)) : Left(error))),
  encode: string.encode,
  schema: () => ({ oneOf: [{ type: 'string' }, { type: 'number' }] }),
})

export const mwsBoolean = Codec.custom<boolean>({
  decode: (x) => {
    switch (x) {
      case 'Yes':
        return Right(true)
      case 'No':
        return Right(false)
      default:
        return Left(
          `Expected a string with a value of either "Yes" or "No", but received a string with value ${JSON.stringify(
            x,
          )}`,
        )
    }
  },
  encode: (x) => x,
  schema: () => ({ type: 'string', enum: ['Yes', 'No'] }),
})

export const mwsDate = Codec.custom<Date>({
  decode: (x) =>
    string.decode(x).chain((aString) => {
      let toDecode = aString
      // @todo
      // Temp fix. Add UTC if no letter is found in string passed
      // (crude way to check if time has timezone)
      if (!/[A-Za-z]/g.test(aString)) {
        toDecode += ' UTC+00:00'
      }
      return date.decode(decodeURIComponent(toDecode))
    }),
  encode: date.encode,
  schema: date.schema,
})

export enum ServiceStatus {
  Green = 'GREEN',
  Yellow = 'YELLOW',
  Red = 'RED',
}

export const serviceStatus = Codec.custom<ServiceStatus>({
  decode: (x) => {
    switch (x) {
      case 'GREEN':
        return Right(ServiceStatus.Green)
      case 'YELLOW':
        return Right(ServiceStatus.Yellow)
      case 'RED':
        return Right(ServiceStatus.Red)
      default:
        return Left(
          `Expected a string with a value of "GREEN", "YELLOW" or "RED", but received a string with value ${JSON.stringify(
            x,
          )}`,
        )
    }
  },
  encode: (x) => x,
  schema: () => ({ type: 'string', enum: ['GREEN', 'YELLOW', 'RED'] }),
})

export class NextToken<T extends string> {
  constructor(private action: T, public token: string) {}
}

export const nextToken = <T extends string>(action: T) =>
  Codec.custom<NextToken<T>>({
    decode: (x) => string.decode(x).map((string_) => new NextToken(action, string_)),
    encode: (x) => x,
    schema: () => ({ type: 'string' }),
  })

/**
 * A shorthand for all SKUs, which are always strings, but when they consist of just numbers,
 * XML parser will parse them to a number.
 */
export const SKU = ensureString

/**
 * A shorthand for all ASINs, which are always strings, but when they consist of just numbers,
 * XML parser will parse them to a number.
 */
export const ASIN = ensureString
