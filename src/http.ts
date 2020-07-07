import { AmazonMarketplace } from '@scaleleap/amazon-marketplaces'
import axios from 'axios'
import parser from 'fast-xml-parser'
import { URLSearchParams } from 'url'

import {
  AccessDenied,
  AccessToFeedProcessingResultDenied,
  AccessToReportDenied,
  ContentMD5DoesNotMatch,
  ContentMD5Missing,
  DependencyFatalException,
  DependencyRetriableException,
  DependencyUnauthorizedException,
  enhanceError,
  FeedCanceled,
  FeedProcessingResultNoLongerAvailable,
  FeedProcessingResultNotReady,
  InputDataError,
  InputStreamDisconnected,
  InternalError,
  InternalErrorFatalException,
  InvalidAccessKeyId,
  InvalidAddress,
  InvalidFeedSubmissionId,
  InvalidFeedType,
  InvalidInputFatalException,
  InvalidOrderState,
  InvalidParameterValue,
  InvalidReportId,
  InvalidReportRequestId,
  InvalidReportType,
  InvalidRequest,
  InvalidScheduleFrequency,
  InvalidUPCIdentifier,
  NonRetriableInternalError,
  PickupSlotNotAvailable,
  QuotaExceeded,
  RegionNotSupported,
  ReportNoLongerAvailable,
  ReportNotReady,
  RequestThrottled,
  ResourceNotFound,
  RetriableInternalError,
  ScheduledPackageAlreadyExists,
  ScheduleWindowExpired,
  SignatureDoesNotMatch,
} from './error'
import { MWSApiError } from './error-codec'
import { sign } from './sign'

export interface MWSOptions {
  marketplace: AmazonMarketplace
  awsAccessKeyId: string
  mwsAuthToken: string
  sellerId: string
  secretKey: string
}

export type HttpMethod = 'GET' | 'POST'
export type ParameterTypes =
  | string
  | number
  | (number | string)[]
  | object[]
  | boolean
  | { [key: string]: ParameterTypes }
  | undefined

export type Parameters = Record<string, ParameterTypes>
export type CleanParameters = Record<string, string>

export enum Resource {
  FulfilmentInventory = 'FulfillmentInventory',
  Orders = 'Orders',
  Products = 'Products',
  Reports = 'Reports',
  Finances = 'Finances',
  Sellers = 'Sellers',
  Subscriptions = 'Subscriptions',
  Feeds = 'Feeds',
  ShipmentInvoicing = 'ShipmentInvoicing',
}

export interface ResourceActions {
  [Resource.Sellers]:
    | 'ListMarketplaceParticipations'
    | 'ListMarketplaceParticipationsByNextToken'
    | 'GetServiceStatus'
  [Resource.Orders]:
    | 'ListOrders'
    | 'ListOrdersByNextToken'
    | 'GetOrder'
    | 'ListOrderItems'
    | 'ListOrderItemsByNextToken'
    | 'GetServiceStatus'
  [Resource.Products]:
    | 'ListMatchingProducts'
    | 'GetMatchingProduct'
    | 'GetMatchingProductForId'
    | 'GetCompetitivePricingForSKU'
    | 'GetCompetitivePricingForASIN'
    | 'GetLowestOfferListingsForSKU'
    | 'GetLowestOfferListingsForASIN'
    | 'GetLowestPricedOffersForSKU'
    | 'GetLowestPricedOffersForASIN'
    | 'GetMyFeesEstimate'
    | 'GetMyPriceForSKU'
    | 'GetMyPriceForASIN'
    | 'GetProductCategoriesForSKU'
    | 'GetProductCategoriesForASIN'
    | 'GetServiceStatus'
  [Resource.FulfilmentInventory]:
    | 'ListInventorySupply'
    | 'ListInventorySupplyByNextToken'
    | 'GetServiceStatus'
  [Resource.Reports]:
    | 'RequestReport'
    | 'GetReportRequestList'
    | 'GetReportRequestListByNextToken'
    | 'GetReportRequestCount'
    | 'CancelReportRequests'
    | 'GetReportList'
    | 'GetReportListByNextToken'
    | 'GetReportCount'
    | 'GetReport'
    | 'ManageReportSchedule'
    | 'GetReportScheduleList'
    | 'GetReportScheduleListByNextToken'
    | 'GetReportScheduleCount'
    | 'UpdateReportAcknowledgements'
  [Resource.Finances]:
    | 'ListFinancialEventGroups'
    | 'ListFinancialEventGroupsByNextToken'
    | 'ListFinancialEvents'
    | 'ListFinancialEventsByNextToken'
  [Resource.Subscriptions]:
    | 'RegisterDestination'
    | 'DeregisterDestination'
    | 'ListRegisteredDestinations'
    | 'SendTestNotificationToDestination'
    | 'CreateSubscription'
    | 'GetSubscription'
    | 'DeleteSubscription'
    | 'ListSubscriptions'
    | 'UpdateSubscription'
    | 'GetServiceStatus'
  [Resource.Feeds]:
    | 'SubmitFeed'
    | 'GetFeedSubmissionList'
    | 'GetFeedSubmissionListByNextToken'
    | 'GetFeedSubmissionCount'
    | 'CancelFeedSubmissions'
    | 'GetFeedSubmissionResult'
  [Resource.ShipmentInvoicing]:
    | 'GetFBAOutboundShipmentDetail'
    | 'SubmitFBAOutboundShipmentInvoice'
    | 'GetFBAOutboundShipmentInvoiceStatus'
    | 'GetServiceStatus'
}

export interface Request {
  url: string
  method: HttpMethod
  headers: Record<string, string>
  data?: string
}

export interface ResourceInfo<TResource extends Resource> {
  resource: TResource
  version: string
  action: ResourceActions[TResource]
  parameters: Parameters
}

export interface RequestMeta {
  requestId: string
  timestamp: Date
  quotaMax: number
  quotaRemaining: number
  quotaResetOn: Date
}

export interface RequestResponse {
  data: string
  headers: Record<string, string>
}

const canonicalizeParameters = (parameters: CleanParameters): string => {
  const sp = new URLSearchParams(parameters)
  sp.sort()
  return sp.toString().replace(/\+/g, '%20')
}

export const toDotNotation = (object: object, prefix: string) => {
  const result: { [key: string]: string | number | boolean } = {}
  function dotify(plainObject: object, currentKey?: string | number) {
    Object.entries(plainObject).forEach(([key, value]) => {
      const newKey = currentKey ? `${currentKey}.${key}` : key // joined key with dot
      if (value && typeof value === 'object') {
        dotify(value, newKey) // it's a nested object, so do it again
      } else {
        Object.assign(result, { [`${prefix}.${newKey}`]: value }) // it's not an object, so set the property
      }
    })
  }

  dotify(object)
  return result
}

export const cleanParameters = (parameters: Parameters): CleanParameters =>
  Object.entries(parameters)
    .filter(([, parameter]) => parameter !== undefined)
    .reduce((result, [key, parameter]) => {
      if (typeof parameter === 'string' || !Number.isNaN(Number(parameter))) {
        /**
         * If parameter is type string or number, assign it to result
         */
        Object.assign(result, { [key]: String(parameter) })
      } else if (Array.isArray(parameter)) {
        /**
         * If parameter is type array reduce it to dotnotation
         */
        parameter.forEach((parameterChild: string | number | object, index: number) => {
          if (typeof parameterChild === 'string' || !Number.isNaN(Number(parameterChild))) {
            Object.assign(result, { [`${key}.${index + 1}`]: String(parameterChild) })
          } else {
            Object.assign(result, toDotNotation(parameterChild as object, `${key}.${index + 1}`))
          }
        })
      } else {
        /**
         * If parameter is type object parameterize it
         */
        Object.entries(
          cleanParameters(parameter as Parameters),
        ).forEach(([innerKey, innerValue]: [string, string]) =>
          Object.assign(result, { [`${key}.${innerKey}`]: innerValue }),
        )
      }

      return result
    }, {} as CleanParameters)

const defaultFetch = ({ url, method, headers, data }: Request): Promise<RequestResponse> =>
  axios({ method, url, headers, data })
    .then((response) => ({
      data: response.data,
      headers: response.headers,
    }))
    .catch((error) => {
      return Promise.reject(error.response.data)
    })

const parseResponse = <T>(
  response: RequestResponse,
  parseString = false,
): [T | string, RequestMeta] => {
  const responseData = parseString ? response.data : parser.parse(response.data)
  return [
    responseData,
    {
      requestId: response.headers['x-mws-request-id'],
      timestamp: new Date(response.headers['x-mws-timestamp']),
      quotaMax: Number(response.headers['x-mws-quota-max']),
      quotaRemaining: Number(response.headers['x-mws-quota-remaining']),
      quotaResetOn: new Date(response.headers['x-mws-quota-resetson']),
    },
  ]
}

export class HttpClient {
  constructor(
    private options: MWSOptions,
    private fetch: <T>(meta: Request) => Promise<RequestResponse> = defaultFetch,
  ) {}

  public async request<TResource extends Resource, TRes>(
    method: HttpMethod,
    info: ResourceInfo<TResource>,
    body?: string,
  ): Promise<[TRes | string, RequestMeta]> {
    const marketplaceUri = this.options.marketplace.webServiceUri

    const host = marketplaceUri.replace('https://', '')
    const url = `${marketplaceUri}/${info.resource}/${info.version}`

    const parameters = {
      AWSAccessKeyId: this.options.awsAccessKeyId,
      Action: info.action,
      MWSAuthToken: this.options.mwsAuthToken,
      SellerId: this.options.sellerId,
      SignatureMethod: 'HmacSHA256',
      SignatureVersion: '2',
      Timestamp: new Date().toISOString(),
      Version: info.version,
      ...cleanParameters(info.parameters),
    }

    const parametersForSigning = canonicalizeParameters(parameters)
    const queryStringToSign = `${method}\n${host}\n/${info.resource}/${info.version}\n${parametersForSigning}`

    const signature = sign(queryStringToSign, this.options.secretKey)
    const parametersWithSignature = { ...parameters, Signature: signature }

    const headers = {
      'user-agent': '@scaleleap/amazon-mws-api-sdk/1.0.0 (Language=JavaScript)',
    }

    let config: Request
    if (method === 'GET') {
      config = {
        url: `${url}?${canonicalizeParameters(parametersWithSignature)}`,
        method,
        headers,
      }
      /**
       * `SubmitFeed` has the feed passed as an XML file in the body
       * and the other parameters as query parameters
       */
    } else if (body && info.action === 'SubmitFeed') {
      config = {
        url: `${url}?${canonicalizeParameters(parametersWithSignature)}`,
        method,
        headers: {
          'Content-Type': 'text/xml',
          ...headers,
        },
        data: body,
      }
    } else {
      config = {
        url,
        method,
        headers,
        data: canonicalizeParameters(parametersWithSignature),
      }
    }

    try {
      const response = await this.fetch(config)

      // GetMatchingProductForId can return an Invalid UPC identifier error message to an otherwise successfully processed request (i.e. 200 status code)
      if (
        info.action === 'GetMatchingProductForId' &&
        response.data.includes('Invalid UPC identifier')
      ) {
        throw new InvalidUPCIdentifier(`${info.action} request failed`)
      }

      /**
       * GetReport and GetFeedSubmissionResult returns a string that should be treated as a file instead of XML data
       * Get Report
       * http://docs.developer.amazonservices.com/en_CA/reports/Reports_GetReport.html
       * GetFeedSubmissionResult
       * http://docs.developer.amazonservices.com/en_CA/feeds/Feeds_GetFeedSubmissionResult.html
       */
      if (info.action === 'GetReport' || info.action === 'GetFeedSubmissionResult') {
        return parseResponse(response, true)
      }

      return parseResponse(response)
    } catch (error) {
      if (parser.validate(error) !== true) {
        throw error
      }

      const maybeResponse = MWSApiError.decode(parser.parse(error))

      if (maybeResponse.isRight()) {
        const response = maybeResponse.extract()
        const errorCode = response.ErrorResponse.Error.Code

        const errorMap = {
          InputStreamDisconnected,
          InvalidParameterValue,
          AccessDenied,
          InvalidAccessKeyId,
          SignatureDoesNotMatch,
          InvalidAddress,
          InternalError,
          // Subscriptions-specific
          'Internal Error': InternalError,
          QuotaExceeded,
          RequestThrottled,
          ResourceNotFound,
          ScheduledPackageAlreadyExists,
          RegionNotSupported,
          ScheduleWindowExpired,
          InvalidOrderState,
          PickupSlotNotAvailable,
          AccessToFeedProcessingResultDenied,
          ContentMD5Missing,
          ContentMD5DoesNotMatch,
          FeedCanceled,
          FeedProcessingResultNoLongerAvailable,
          FeedProcessingResultNotReady,
          InputDataError,
          InvalidFeedSubmissionId,
          InvalidFeedType,
          InvalidRequest,
          NonRetriableInternalError,
          RetriableInternalError,
          AccessToReportDenied,
          InvalidReportId,
          InvalidReportRequestId,
          InvalidReportType,
          InvalidScheduleFrequency,
          ReportNoLongerAvailable,
          ReportNotReady,
          DependencyFatalException,
          DependencyRetriableException,
          DependencyUnauthorizedException,
          InternalErrorFatalException,
          InvalidInputFatalException,
        }

        const ErrorToThrow = errorMap[errorCode]

        throw enhanceError(new ErrorToThrow(`${info.action} request failed`), response)
      } else {
        throw error
      }
    }
  }
}
