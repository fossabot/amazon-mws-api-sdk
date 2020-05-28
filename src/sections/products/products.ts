import { ParsingError } from '../../error'
import { HttpClient, RequestMeta, Resource } from '../../http'
import {
  GetCompetitivePricingForASINResponse,
  GetCompetitivePricingForASINResult,
  GetCompetitivePricingForSKUResponse,
  GetCompetitivePricingForSKUResult,
  GetLowestOfferListingsForASINResponse,
  GetLowestOfferListingsForASINResult,
  GetLowestOfferListingsForSKUResponse,
  GetLowestOfferListingsForSKUResult,
  GetLowestPricedOffersForSKU,
  GetLowestPricedOffersForSKUResponse,
  GetMatchingProductForIdResponse,
  GetMatchingProductForIdResponseCodec,
  GetMatchingProductResponse,
  GetMatchingProductResult,
  GetMyFeesEstimate,
  GetMyFeesEstimateResponse,
  ListMatchingProducts,
  ListMatchingProductsResponse,
} from './codec'
import {
  GetCompetitivePricingForAsinParameters,
  GetCompetitivePricingForSkuParameters,
  GetLowestOfferListingsForAsinParameters,
  GetLowestOfferListingsForSkuParameters,
  GetLowestPricedOffersForSkuParameters,
  GetMatchingProductForIdParameters,
  GetMatchingProductParameters,
  GetMyFeesEstimateParameters,
  ListMatchingProductsRequestParameters,
} from './type'

const PRODUCTS_API_VERSION = '2011-10-01'

export class Products {
  constructor(private httpClient: HttpClient) {}

  async listMatchingProducts(
    parameters: ListMatchingProductsRequestParameters,
  ): Promise<[ListMatchingProducts, RequestMeta]> {
    const [response, meta] = await this.httpClient.request('POST', {
      resource: Resource.Products,
      version: PRODUCTS_API_VERSION,
      action: 'ListMatchingProducts',
      parameters,
    })

    return ListMatchingProductsResponse.decode(response).caseOf({
      Right: (x) => [x.ListMatchingProductsResponse.ListMatchingProductsResult, meta],
      Left: (error) => {
        throw new ParsingError(error)
      },
    })
  }

  async getMyFeesEstimate(
    parameters: GetMyFeesEstimateParameters,
  ): Promise<[GetMyFeesEstimate, RequestMeta]> {
    const [response, meta] = await this.httpClient.request('POST', {
      resource: Resource.Products,
      version: PRODUCTS_API_VERSION,
      action: 'GetMyFeesEstimate',
      parameters,
    })

    return GetMyFeesEstimateResponse.decode(response).caseOf({
      Right: (x) => [x.GetMyFeesEstimateResponse.GetMyFeesEstimateResult, meta],
      Left: (error) => {
        throw new ParsingError(error)
      },
    })
  }

  async getMatchingProduct(
    parameters: GetMatchingProductParameters,
  ): Promise<[GetMatchingProductResult, RequestMeta]> {
    const [response, meta] = await this.httpClient.request('POST', {
      resource: Resource.Products,
      version: PRODUCTS_API_VERSION,
      action: 'GetMatchingProduct',
      parameters: {
        'ASINList.ASIN': parameters.ASINList,
        MarketplaceId: parameters.MarketplaceId,
      },
    })

    return GetMatchingProductResponse.decode(response).caseOf({
      Right: (x) => [x.GetMatchingProductResponse, meta],
      Left: (error) => {
        throw new ParsingError(error)
      },
    })
  }

  async getMatchingProductForId(
    parameters: GetMatchingProductForIdParameters,
  ): Promise<[GetMatchingProductForIdResponse, RequestMeta]> {
    const [response, meta] = await this.httpClient.request('POST', {
      resource: Resource.Products,
      version: PRODUCTS_API_VERSION,
      action: 'GetMatchingProductForId',
      parameters: {
        'IdList.Id': parameters.IdList,
        IdType: parameters.IdType,
        MarketplaceId: parameters.MarketplaceId,
      },
    })

    return GetMatchingProductForIdResponseCodec.decode(response).caseOf({
      Right: (x) => [x.GetMatchingProductForIdResponse, meta],
      Left: (error) => {
        throw new ParsingError(error)
      },
    })
  }

  async getCompetitivePricingForSku(
    parameters: GetCompetitivePricingForSkuParameters,
  ): Promise<[GetCompetitivePricingForSKUResult, RequestMeta]> {
    const [response, meta] = await this.httpClient.request('POST', {
      resource: Resource.Products,
      version: PRODUCTS_API_VERSION,
      action: 'GetCompetitivePricingForSKU',
      parameters: {
        'SellerSKUList.SellerSKU': parameters.SellerSKUList,
        MarketplaceId: parameters.MarketplaceId,
      },
    })

    return GetCompetitivePricingForSKUResponse.decode(response).caseOf({
      Right: (x) => [x.GetCompetitivePricingForSKUResponse, meta],
      Left: (error) => {
        throw new ParsingError(error)
      },
    })
  }

  async getCompetitivePricingForAsin(
    parameters: GetCompetitivePricingForAsinParameters,
  ): Promise<[GetCompetitivePricingForASINResult, RequestMeta]> {
    const [response, meta] = await this.httpClient.request('POST', {
      resource: Resource.Products,
      version: PRODUCTS_API_VERSION,
      action: 'GetCompetitivePricingForASIN',
      parameters: {
        'ASINList.ASIN': parameters.ASINList,
        MarketplaceId: parameters.MarketplaceId,
      },
    })

    return GetCompetitivePricingForASINResponse.decode(response).caseOf({
      Right: (x) => [x.GetCompetitivePricingForASINResponse, meta],
      Left: (error) => {
        throw new ParsingError(error)
      },
    })
  }

  async getLowestOfferListingsForSku(
    parameters: GetLowestOfferListingsForSkuParameters,
  ): Promise<[GetLowestOfferListingsForSKUResult, RequestMeta]> {
    const [response, meta] = await this.httpClient.request('POST', {
      resource: Resource.Products,
      version: PRODUCTS_API_VERSION,
      action: 'GetLowestOfferListingsForSKU',
      parameters: {
        MarketplaceId: parameters.MarketplaceId,
        'SellerSKUList.SellerSKU': parameters.SellerSKUList,
        ItemCondition: parameters.ItemCondition,
      },
    })

    return GetLowestOfferListingsForSKUResponse.decode(response).caseOf({
      Right: (x) => [x.GetLowestOfferListingsForSKUResponse, meta],
      Left: (error) => {
        throw new ParsingError(error)
      },
    })
  }

  async getLowestOfferListingsForAsin(
    parameters: GetLowestOfferListingsForAsinParameters,
  ): Promise<[GetLowestOfferListingsForASINResult, RequestMeta]> {
    const [response, meta] = await this.httpClient.request('POST', {
      resource: Resource.Products,
      version: PRODUCTS_API_VERSION,
      action: 'GetLowestOfferListingsForASIN',
      parameters: {
        'ASINList.ASIN': parameters.ASINList,
        MarketplaceId: parameters.MarketplaceId,
        ItemCondition: parameters.ItemCondition,
      },
    })

    return GetLowestOfferListingsForASINResponse.decode(response).caseOf({
      Right: (x) => [x.GetLowestOfferListingsForASINResponse, meta],
      Left: (error) => {
        throw new ParsingError(error)
      },
    })
  }

  async getLowestPricedOffersForSku(
    parameters: GetLowestPricedOffersForSkuParameters,
  ): Promise<[GetLowestPricedOffersForSKU, RequestMeta]> {
    const [response, meta] = await this.httpClient.request('POST', {
      resource: Resource.Products,
      version: PRODUCTS_API_VERSION,
      action: 'GetLowestPricedOffersForSKU',
      parameters,
    })

    return GetLowestPricedOffersForSKUResponse.decode(response).caseOf({
      Right: (x) => [x.GetLowestPricedOffersForSKUResponse.GetLowestPricedOffersForSKUResult, meta],
      Left: (error) => {
        throw new ParsingError(error)
      },
    })
  }
}
